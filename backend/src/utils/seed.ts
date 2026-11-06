import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const ensureDefaultAdminAndSeed = async () => {
  try {
    const adminEmail = 'admin@book.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await prisma.user.create({
        data: {
          name: 'Адміністратор',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      const bookCount = await prisma.book.count();
      if (bookCount === 0) {
        await prisma.book.createMany({
          data: [
            {
              name: 'Тигролови',
              author: 'Іван Багряний',
              photo: '/covers/tyhrolovy.jpg',
              description: 'Пригодницький роман про силу духу та боротьбу за свободу.',
              ownerId: admin.id,
            },
            {
              name: 'Місто',
              author: 'Валер’ян Підмогильний',
              photo: '/covers/misto.jpg',
              description: 'Урбаністичний психологічний роман про підкорення Києва.',
              ownerId: admin.id,
            },
            {
              name: 'Тіні забутих предків',
              author: 'Михайло Коцюбинський',
              photo: '/covers/tini.jpg',
              description: 'Повість про карпатське кохання Івана та Марічки.',
              ownerId: admin.id,
            },
          ],
        });
      }
      console.log('🌱 Створено тестового адміна: admin@book.com / admin123 та стартові книги');
    }
  } catch (err) {
    console.error('Seed warning:', err);
  }
};

