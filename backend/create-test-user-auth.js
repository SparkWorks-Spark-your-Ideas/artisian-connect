/**
 * Script to create Firebase Authentication for existing Firestore user
 * Run this once to enable login for the old test user
 */

import { auth, db } from './src/config/firebase.js';

const OLD_USER_UID = 'ayLcMRna2aKNK1bT3Vw0';
const EMAIL = 'sparkworks@gmail.com'; // From your Firebase screenshot
const PASSWORD = 'password'; // Set whatever password you want

async function createAuthForExistingUser() {
  try {
    console.log('🔧 Creating Firebase Auth for existing user...');
    console.log('📧 Email:', EMAIL);
    console.log('🆔 UID:', OLD_USER_UID);

    // Create user in Firebase Auth with the same UID
    const userRecord = await auth.createUser({
      uid: OLD_USER_UID,
      email: EMAIL,
      password: PASSWORD,
      displayName: 'SparkWorks',
      emailVerified: false
    });

    console.log('✅ Successfully created Firebase Auth user!');
    console.log('📋 User Record:', {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName
    });

    // Update Firestore document to ensure isActive is true
    console.log('\n📝 Updating Firestore user document...');
    await db.collection('users').doc(OLD_USER_UID).update({
      isActive: true,
      email: EMAIL,
      updatedAt: new Date()
    });
    console.log('✅ Firestore document updated with isActive: true');
    
    console.log('\n🎉 You can now login with:');
    console.log('   Email:', EMAIL);
    console.log('   Password:', PASSWORD);
    
  } catch (error) {
    if (error.code === 'auth/uid-already-exists') {
      console.log('⚠️ User already exists in Firebase Auth');
      console.log('💡 Updating Firestore to enable account...');
      
      // Still update Firestore to set isActive: true
      try {
        await db.collection('users').doc(OLD_USER_UID).update({
          isActive: true,
          email: EMAIL,
          updatedAt: new Date()
        });
        console.log('✅ Account enabled! You can now login with:', EMAIL);
      } catch (updateError) {
        console.error('❌ Failed to update Firestore:', updateError.message);
      }
    } else if (error.code === 'auth/email-already-exists') {
      console.log('⚠️ Email already exists in Firebase Auth');
      console.log('💡 Updating Firestore to enable account...');
      
      // Still update Firestore
      try {
        await db.collection('users').doc(OLD_USER_UID).update({
          isActive: true,
          email: EMAIL,
          updatedAt: new Date()
        });
        console.log('✅ Account enabled! You can now login with:', EMAIL);
      } catch (updateError) {
        console.error('❌ Failed to update Firestore:', updateError.message);
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createAuthForExistingUser();
