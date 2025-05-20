import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORY_NAME } from '../src/constants/category.js';

const prisma = new PrismaClient();

async function main() {
  // 이미 "기타" 카테고리가 있으면 추가하지 않음
  const exists = await prisma.category.findFirst({
    where: { name: DEFAULT_CATEGORY_NAME }
  });

  if (!exists) {
    await prisma.category.create({
      data: {
        name: DEFAULT_CATEGORY_NAME,
        description: '기본 카테고리 (기타)'
      }
    });
    console.log(`카테고리 "${DEFAULT_CATEGORY_NAME}"가 생성되었습니다.`);
  } else {
    console.log(`카테고리 "${DEFAULT_CATEGORY_NAME}"가 이미 존재합니다.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
