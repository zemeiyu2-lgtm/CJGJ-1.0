// ============================================================
// 🔑 请把下面两个值换成你自己的 Supabase 配置
// 在 Supabase 控制台 → Settings → API 中获取
// ============================================================

const SUPABASE_URL = 'https://你的项目ID.supabase.co';
const SUPABASE_ANON_KEY = '你的anon公钥';

// ============================================================
// 以下代码不需要修改
// ============================================================

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
}

async function login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    return { data, error };
}

async function signup(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({ 
        email, 
        password,
        options: {
            emailRedirectTo: window.location.origin + '/index.html'
        }
    });
    return { data, error };
}

async function logout() {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
}

async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

// 云端进度操作
async function loadProgress(userId) {
    const { data, error } = await supabaseClient
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error('加载进度失败:', error);
        return null;
    }
    return data;
}

async function saveProgress(userId, progress) {
    // 先检查是否存在记录
    const existing = await loadProgress(userId);
    if (existing) {
        const { error } = await supabaseClient
            .from('user_progress')
            .update({
                current_day: progress.currentDay,
                completed_days: progress.completedDays,
                step1_completed: progress.steps[1].completed,
                step2_completed: progress.steps[2].completed,
                step3_completed: progress.steps[3].completed,
                step4_completed: progress.steps[4].completed,
                step2_text: progress.steps[2].text || '',
                step3_text: progress.steps[3].text || '',
                step4_text: progress.steps[4].text || '',
                total_score: progress.totalScore || 0,
                current_streak: progress.currentStreak || 0,
                best_streak: progress.bestStreak || 0,
                last_study_date: progress.lastStudyDate || null,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        if (error) console.error('更新进度失败:', error);
        return { error };
    } else {
        const { error } = await supabaseClient
            .from('user_progress')
            .insert({
                user_id: userId,
                current_day: progress.currentDay,
                completed_days: progress.completedDays,
                step1_completed: progress.steps[1].completed,
                step2_completed: progress.steps[2].completed,
                step3_completed: progress.steps[3].completed,
                step4_completed: progress.steps[4].completed,
                step2_text: progress.steps[2].text || '',
                step3_text: progress.steps[3].text || '',
                step4_text: progress.steps[4].text || '',
                total_score: progress.totalScore || 0,
                current_streak: progress.currentStreak || 0,
                best_streak: progress.bestStreak || 0,
                last_study_date: progress.lastStudyDate || null
            });
        if (error) console.error('创建进度失败:', error);
        return { error };
    }
}

async function addStudyEvent(userId, eventType, points, eventData) {
    const { error } = await supabaseClient
        .from('study_events')
        .insert({
            user_id: userId,
            event_type: eventType,
            event_data: eventData || {},
            points: points || 0
        });
    if (error) console.error('记录学习事件失败:', error);
    return { error };
}
