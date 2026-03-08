const API_URL = 'http://localhost:3000/api/v1';

async function runSmokeTest() {
    try {
        console.log('--- Phase 1: Registration ---');
        const user1Email = `user1_${Date.now()}@example.com`;
        const user2Email = `user2_${Date.now()}@example.com`;

        const reg1Res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'User One', email: user1Email, password: 'Password123!' }),
        });
        const reg1 = await reg1Res.json();
        const user1Id = reg1.data.user._id;

        const reg2Res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'User Two', email: user2Email, password: 'Password123!' }),
        });
        const reg2 = await reg2Res.json();
        const user2Id = reg2.data.user._id;

        console.log('\n--- Phase 2: Login ---');
        const login1Res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user1Email, password: 'Password123!' }),
        });
        const l1 = await login1Res.json();
        const token1 = l1.data.accessToken;

        const login2Res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user2Email, password: 'Password123!' }),
        });
        const l2 = await login2Res.json();
        const token2 = l2.data.accessToken;

        console.log('\n--- Phase 3: Following ---');
        const fRes = await fetch(`${API_URL}/follows/users/${user2Id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token1}` }
        });
        console.log('Follow Status:', fRes.status);

        await new Promise(r => setTimeout(r, 1000));

        console.log('\n--- Phase 4: Verify User 2 Notification (New Follower) ---');
        const notifs2Res = await fetch(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token2}` }
        });
        const notifs2 = await notifs2Res.json();
        console.log('User 2 Notifications:', notifs2.data.data.length);
        if (notifs2.data.data.length === 0) throw new Error('Notification not found');

        console.log('\n--- Phase 5: Comments & Likes ---');
        const epRes = await fetch(`${API_URL}/episodes?limit=5`);
        const eps = await epRes.json();
        console.log('Episodes count:', eps.data.data.length);

        if (eps.data.data.length > 0) {
            const episodeId = eps.data.data[0]._id;
            const cRes = await fetch(`${API_URL}/comments/episodes/${episodeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
                body: JSON.stringify({ text: 'Smoke test comment' })
            });
            const c = await cRes.json();
            const commentId = c.data._id;
            console.log('Comment Created:', commentId);

            const clRes = await fetch(`${API_URL}/comment-likes/comments/${commentId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token2}` }
            });
            console.log('Like Status:', clRes.status);

            await new Promise(r => setTimeout(r, 1000));

            console.log('\n--- Phase 6: Verify User 1 Notification (Comment Like) ---');
            const notifs1Res = await fetch(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token1}` }
            });
            const notifs1 = await notifs1Res.json();
            console.log('User 1 Notifications:', notifs1.data.data.length);
            if (notifs1.data.data.length === 0) throw new Error('Comment Like notification missing');
        }

        console.log('\n✅ SMOKE TEST FULLY SUCCESSFUL');
    } catch (error) {
        console.error('❌ FAILED:', error.message);
        process.exit(1);
    }
}

runSmokeTest();
