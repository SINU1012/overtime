const { db, FieldValue } = require("../config/firebase");

const usersCollection = db.collection("Users");

// 모든 사용자 조회
exports.getUsers = async (req, res) => {
  try {
    console.log('getUsers called with query:', req.query);
    const { includeInactive } = req.query;
    
    let query = usersCollection;
    
    // 기본적으로 활성 사용자만 조회
    if (includeInactive !== 'true') {
      query = query.where('isActive', '==', true);
    }
    
    console.log('Attempting to fetch users from Firestore...');
    const snapshot = await query.orderBy('name').get();
    const users = [];
    
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Successfully fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error("사용자 조회 오류:", error);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);
    
    // Firebase 초기화 오류인 경우 특별한 메시지 반환
    if (error.message === 'Firebase not initialized') {
      return res.status(503).json({ 
        error: "Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.",
        detail: "SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다."
      });
    }
    
    // Firestore 권한 오류
    if (error.code === 7 || error.code === 'permission-denied') {
      return res.status(403).json({ 
        error: "Firestore 접근 권한이 없습니다.",
        detail: "서비스 계정 권한을 확인해주세요."
      });
    }
    
    res.status(500).json({ 
      error: "사용자 조회 중 오류가 발생했습니다.",
      message: error.message,
      code: error.code
    });
  }
};

// 새 사용자 추가
exports.createUser = async (req, res) => {
  try {
    const { name, department, position } = req.body;
    
    // 필수 필드 검증
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "사용자 이름은 필수입니다." });
    }
    
    // 이름 형식 검증 (한글, 영문, 숫자, 공백만 허용)
    const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ error: "이름은 한글, 영문, 숫자, 공백만 사용 가능합니다." });
    }
    
    // 중복 이름 체크
    const existingUser = await usersCollection
      .where('name', '==', name.trim())
      .where('isActive', '==', true)
      .get();
      
    if (!existingUser.empty) {
      return res.status(400).json({ error: "이미 존재하는 사용자 이름입니다." });
    }
    
    // 새 사용자 생성
    const newUser = {
      name: name.trim(),
      department: department || '',
      position: position || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    };
    
    const docRef = await usersCollection.add(newUser);
    
    res.status(201).json({
      id: docRef.id,
      ...newUser
    });
  } catch (error) {
    console.error("사용자 추가 오류:", error);
    res.status(500).json({ error: "사용자 추가 중 오류가 발생했습니다." });
  }
};

// 사용자 정보 수정
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, position } = req.body;
    
    // 사용자 존재 확인
    const userDoc = await usersCollection.doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    // 이름 변경 시 검증
    if (name) {
      const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/;
      if (!nameRegex.test(name)) {
        return res.status(400).json({ error: "이름은 한글, 영문, 숫자, 공백만 사용 가능합니다." });
      }
      
      // 다른 사용자와 중복 체크
      const existingUser = await usersCollection
        .where('name', '==', name.trim())
        .where('isActive', '==', true)
        .get();
        
      if (!existingUser.empty && existingUser.docs[0].id !== id) {
        return res.status(400).json({ error: "이미 존재하는 사용자 이름입니다." });
      }
      
      updateData.name = name.trim();
    }
    
    if (department !== undefined) updateData.department = department;
    if (position !== undefined) updateData.position = position;
    
    await usersCollection.doc(id).update(updateData);
    
    const updatedUser = await usersCollection.doc(id).get();
    
    res.json({
      id: updatedUser.id,
      ...updatedUser.data()
    });
  } catch (error) {
    console.error("사용자 수정 오류:", error);
    res.status(500).json({ error: "사용자 수정 중 오류가 발생했습니다." });
  }
};

// 사용자 삭제 (소프트 삭제)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 사용자 존재 확인
    const userDoc = await usersCollection.doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    
    // 소프트 삭제 처리
    await usersCollection.doc(id).update({
      isActive: false,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.json({ message: "사용자가 삭제되었습니다." });
  } catch (error) {
    console.error("사용자 삭제 오류:", error);
    res.status(500).json({ error: "사용자 삭제 중 오류가 발생했습니다." });
  }
};

// 기존 사용자 데이터 마이그레이션 (초기 1회 실행용)
exports.migrateUsers = async (req, res) => {
  try {
    const defaultUsers = [
      "김지운", "채충헌", "박형준", "김태율", "박상우", "박신우",
      "김준서", "김은솔", "김세연", "변성훈", "유창현", "이지우",
      "김진옥", "송봄"
    ];
    
    const migrationResults = [];
    
    for (const userName of defaultUsers) {
      // 이미 존재하는지 확인
      const existing = await usersCollection
        .where('name', '==', userName)
        .get();
        
      if (existing.empty) {
        const newUser = {
          name: userName,
          department: '',
          position: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null
        };
        
        const docRef = await usersCollection.add(newUser);
        migrationResults.push({
          name: userName,
          id: docRef.id,
          status: 'created'
        });
      } else {
        migrationResults.push({
          name: userName,
          id: existing.docs[0].id,
          status: 'already_exists'
        });
      }
    }
    
    res.json({
      message: "사용자 마이그레이션 완료",
      results: migrationResults
    });
  } catch (error) {
    console.error("사용자 마이그레이션 오류:", error);
    res.status(500).json({ error: "사용자 마이그레이션 중 오류가 발생했습니다." });
  }
};