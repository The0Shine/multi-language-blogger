const { Language } = require('../models');

async function updateLanguageStatus() {
  try {
    console.log('🔧 Updating all language status to 1...');

    // Update tất cả language status thành 1
    const result = await Language.update(
      { status: 1 },
      { 
        where: {}, // Update tất cả records
        paranoid: false // Include soft-deleted records
      }
    );

    console.log(`✅ Updated ${result[0]} language records to status = 1`);

    // Kiểm tra kết quả
    const languages = await Language.findAll({
      attributes: ['languageid', 'language_name', 'status'],
      paranoid: false
    });

    console.log('\n📋 Current language status:');
    languages.forEach(lang => {
      console.log(`- ${lang.language_name}: status = ${lang.status}`);
    });

    console.log('\n🎉 Language status update completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating language status:', error);
    process.exit(1);
  }
}

updateLanguageStatus();
