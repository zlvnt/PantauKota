import { prisma } from '@/lib/prisma';

async function checkAdminStatus() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@pantaukota.id' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (admin) {
      console.log('Admin user found:');
      console.log('ID:', admin.id);
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('isActive:', admin.isActive);
      console.log('Created at:', admin.createdAt);
      
      if (!admin.isActive) {
        console.log('\n⚠️  Admin user is INACTIVE! This is why login is failing.');
        console.log('Updating admin to active...');
        
        const updatedAdmin = await prisma.user.update({
          where: { id: admin.id },
          data: { isActive: true },
          select: { id: true, name: true, email: true, role: true, isActive: true },
        });
        
        console.log('✅ Admin user updated to active!');
        console.log('Updated admin:', updatedAdmin);
      } else {
        console.log('✅ Admin user is already active.');
      }
    } else {
      console.log('❌ Admin user not found with email admin@pantaukota.id');
    }

    // Check all users
    console.log('\n📋 All users status:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    allUsers.forEach(user => {
      console.log(`${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
    });

  } catch (error) {
    console.error('Error checking admin status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkAdminStatus();