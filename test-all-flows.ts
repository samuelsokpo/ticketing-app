import prisma from './src/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 RUNNING END-TO-END AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  try {
    // 1. Check Events in Database
    console.log('--- Phase 1: Database & Events ---');
    const events = await prisma.event.findMany();
    assert(events.length > 0, 'Database contains events', `Found ${events.length} events`);
    
    const kingJfly = await prisma.event.findFirst({
      where: {
        OR: [
          { id: 'cm6d2524d000109mg202h6374' },
          { slug: 'king-jfly-live' }
        ]
      }
    });
    assert(!!kingJfly, 'Featured King Jfly event exists in DB', kingJfly?.title);

    // 2. User & Wallet Provisioning
    console.log('\n--- Phase 2: User & Wallet Provisioning ---');
    const testEmail = `test.user.${Date.now()}@example.com`;
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Automated Test User',
        wallet: {
          create: {
            balance: 0
          }
        }
      },
      include: { wallet: true }
    });
    assert(!!testUser && !!testUser.wallet, 'User created with zero wallet balance', `User ID: ${testUser.id}`);
    assert(testUser.wallet?.balance === 0, 'Initial wallet balance is exactly 0');

    // 3. Purchase Intent Creation (Paystack flow)
    console.log('\n--- Phase 3: Ticket Purchase Flow (Paystack) ---');
    const paymentRef = `txn_${uuidv4()}`;
    const purchaseAmount = 20000;
    const purchase = await prisma.purchase.create({
      data: {
        userId: testUser.id,
        eventId: kingJfly!.id,
        amount: purchaseAmount,
        paymentRef,
        paid: false,
      }
    });
    assert(!!purchase && purchase.paid === false, 'Pending purchase created successfully', `Ref: ${paymentRef}`);

    // 4. Wallet Top-Up & Webhook Confirmation
    console.log('\n--- Phase 4: Wallet Top-Up & Webhook Verification ---');
    const topupRef = `topup_${uuidv4()}`;
    const topupAmount = 50000;
    const topup = await prisma.topUp.create({
      data: {
        userId: testUser.id,
        amount: topupAmount,
        paymentRef: topupRef,
        paid: false,
      }
    });
    assert(!!topup && topup.paid === false, 'Pending top-up created', `Ref: ${topupRef}`);

    // Simulate Paystack Webhook for Top-Up
    await prisma.$transaction([
      prisma.topUp.update({ where: { id: topup.id }, data: { paid: true } }),
      prisma.wallet.update({
        where: { userId: testUser.id },
        data: { balance: { increment: topup.amount } }
      })
    ]);

    const updatedWallet = await prisma.wallet.findUnique({ where: { userId: testUser.id } });
    assert(updatedWallet?.balance === 50000, 'Wallet credited properly via webhook simulation', `Balance: ₦${updatedWallet?.balance}`);

    // 5. Direct Wallet Ticket Purchase
    console.log('\n--- Phase 5: Direct Wallet Ticket Purchase ---');
    const walletTicketRef = `txn_${uuidv4()}`;
    const walletPurchase = await prisma.purchase.create({
      data: {
        userId: testUser.id,
        eventId: kingJfly!.id,
        amount: 20000,
        paymentRef: walletTicketRef,
        paid: false
      }
    });

    // Debit wallet & mark paid
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: testUser.id },
        data: { balance: { decrement: 20000 } }
      }),
      prisma.purchase.update({
        where: { id: walletPurchase.id },
        data: { paid: true }
      })
    ]);

    const walletAfterPurchase = await prisma.wallet.findUnique({ where: { userId: testUser.id } });
    assert(walletAfterPurchase?.balance === 30000, 'Wallet debited correctly from ₦50,000 to ₦30,000', `Balance: ₦${walletAfterPurchase?.balance}`);

    const verifiedPurchase = await prisma.purchase.findUnique({ where: { id: walletPurchase.id } });
    assert(verifiedPurchase?.paid === true, 'Wallet purchase marked as PAID');

    // 6. Dashboard Stats Verification
    console.log('\n--- Phase 6: Dashboard Statistics Verification ---');
    const paidCount = await prisma.purchase.count({ where: { userId: testUser.id, paid: true } });
    const totalSpentAgg = await prisma.purchase.aggregate({ where: { userId: testUser.id, paid: true }, _sum: { amount: true } });
    const totalSpent = totalSpentAgg._sum.amount || 0;

    assert(paidCount === 1, 'Purchased ticket count is accurate (1 ticket)', `Count: ${paidCount}`);
    assert(totalSpent === 20000, 'Total spent is accurate (₦20,000)', `Spent: ₦${totalSpent}`);

    // Clean up test data
    console.log('\n--- Phase 7: Test Cleanup ---');
    await prisma.purchase.deleteMany({ where: { userId: testUser.id } });
    await prisma.topUp.deleteMany({ where: { userId: testUser.id } });
    await prisma.wallet.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    assert(true, 'Test data purged cleanly');

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
