const fs = require('fs');
const file = 'app/api/checkout/route.ts';
let p = fs.readFileSync(file, 'utf8');

const target = `const body = await request.json();`;
const injection = `
    // SINKRONISASI USER: Pastikan user dari Supabase auth benar-benar ada di tabel public.User Prisma
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email || "customer@example.com",
        name: user.user_metadata?.name || user.email?.split('@')[0] || "Customer",
        role: "CUSTOMER"
      }
    });

    const body = await request.json();`;

if (p.includes(target) && !p.includes('SINKRONISASI USER')) {
  p = p.replace(target, injection);
  fs.writeFileSync(file, p);
  console.log('Injected user sync into checkout API');
} else {
  console.log('Already injected or target not found');
}
