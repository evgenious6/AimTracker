import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Настраиваем axios, чтобы он передавал куки сессии на бэкенд
axios.defaults.withCredentials = true

// Базовый адрес вашего бэкенда (порт 3000)
const API_URL = '/api'
// Массив мотивационных фраз
const MOTIVATIONAL_QUOTES = [
    "У тебя всё получится!",
    "Ты справишься!",
    "Верь в себя!",
    "Маленькие шаги ведут к большим целям.",
    "Сегодня отличный день, чтобы начать!",
    "Твой успех зависит от тебя!",
    "Не сдавайся, всё получится!"
];

function App() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)
    const [error, setError] = useState('')
    const [isRegistering, setIsRegistering] = useState(false);
    const [quote, setQuote] = useState('');
    // НОВЫЕ СТЕЙТЫ ДЛЯ ЦЕЛЕЙ
    const [goals, setGoals] = useState([]); // Список целей
    const [isModalOpen, setIsModalOpen] = useState(false); // Открыто ли окно создания
    const [newGoalTitle, setNewGoalTitle] = useState(''); // Текст новой цели
    const [newGoalDesc, setNewGoalDesc] = useState(''); // Описание новой цели
    const [selectedGoal, setSelectedGoal] = useState(null); // Цель, которую открыли
    const [newSubGoalTitle, setNewSubGoalTitle] = useState(''); // Текст новой подцели

    // Проверяем авторизацию при загрузке страницы
    useEffect(() => {
        axios.get(`${API_URL}/logged_in`, { withCredentials: true })
            .then(response => {
                if (response.data.logged_in) {
                    setUser(response.data.user);
                    fetchGoals(); // <-- ВЫЗЫВАЕМ ЗАГРУЗКУ ЦЕЛЕЙ
                }
            })
            .catch(err => console.log('Ошибка проверки сессии:', err))
    }, []);
    // Выбираем случайную фразу при загрузке
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        setQuote(MOTIVATIONAL_QUOTES[randomIndex]);
    }, []);

    // Вход
    const handleLogin = (e) => {
        e.preventDefault()
        setError('')

        axios.post(`${API_URL}/login`, {
            user: {
                email: email,
                password: password
            }
        })
            .then(response => {
                if (response.data.logged_in) {
                    setUser(response.data.user)
                    fetchGoals(); // <-- ДОБАВЛЯЕМ ЭТУ СТРОЧКУ, чтобы загрузить цели нового юзера
                }
            })
            .catch(err => {
                if (err.response && err.response.data.error) {
                    setError(err.response.data.error)
                } else {
                    setError('Произошла ошибка при подключении к серверу')
                }
            })
    }
    const handleRegister = (e) => {
        e.preventDefault();
        setError('');

        axios.post(`${API_URL}/register`, {
            user: {
                email: email,
                password: password
            }
        })
            .then(response => {
                alert('Регистрация успешна! Теперь вы можете войти.');
                setIsRegistering(false); // Переключаем обратно на форму входа
                setPassword(''); // Очищаем поле пароля
            })
            .catch(err => {
                if (err.response && err.response.data.errors) {
                    setError(err.response.data.errors.join(', '));
                } else {
                    setError('Ошибка при регистрации');
                }
            });
    };

    // Выход
    const handleLogout = () => {
        axios.delete(`${API_URL}/logout`)
            .then(() => {
                setUser(null)
                setEmail('')
                setPassword('')
                setGoals([]); // <-- ДОБАВЛЯЕМ ЭТУ СТРОЧКУ, чтобы очистить список целей в памяти
            })
            .catch(err => console.log('Ошибка выхода:', err))
    }
    // Загрузка целей с бэкенда
    const fetchGoals = () => {
        axios.get(`${API_URL}/goals`)
            .then(response => {
                setGoals(response.data);
            })
            .catch(err => console.log('Ошибка загрузки целей:', err));
    };

    // Создание новой цели
    const handleCreateGoal = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/goals`, {
            title: newGoalTitle,
            description: newGoalDesc
        })
            .then(() => {
                setIsModalOpen(false); // Закрываем модалку
                setNewGoalTitle(''); // Очищаем поля
                setNewGoalDesc('');
                fetchGoals(); // Обновляем список целей, чтобы новая появилась на экране
            })
            .catch(err => console.log('Ошибка создания цели:', err));
    };
    // Создать подцель
    const handleCreateSubGoal = (e) => {
        e.preventDefault();
        if (!newSubGoalTitle.trim()) return;

        axios.post(`${API_URL}/sub_goals`, {
            goal_id: selectedGoal.id, // <-- Передаем ID цели в теле
            title: newSubGoalTitle
        })
            .then(response => {
                setSelectedGoal(prev => ({
                    ...prev,
                    sub_goals: [...(prev.sub_goals || []), response.data.sub_goal]
                }));
                setNewSubGoalTitle('');
                fetchGoals();
            })
            .catch(err => {
                console.error('Ошибка добавления подцели:', err);
                alert('Не удалось добавить шаг: ' + (err.response?.data?.error || err.message));
            });
    };

    // Переключить статус подцели (галочка)
    const handleToggleSubGoal = (subGoalId) => {
        axios.patch(`${API_URL}/sub_goals/toggle`, {
            id: subGoalId // <-- Передаем ID подцели в теле
        })
            .then(response => {
                const updatedSubGoal = response.data.sub_goal;
                setSelectedGoal(prev => {
                    const updatedSubGoals = prev.sub_goals.map(sg =>
                        sg.id === subGoalId ? updatedSubGoal : sg
                    );
                    return {
                        ...prev,
                        sub_goals: updatedSubGoals,
                        progress: response.data.goal_progress
                    };
                });
                fetchGoals();
            })
            .catch(err => {
                console.error('Ошибка переключения подцели:', err);
                alert('Не удалось изменить статус: ' + (err.response?.data?.error || err.message));
            });
    };

    if (user) {
        return (
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="profile-icon" title={user.email}>
                        👤
                    </div>
                    <button onClick={handleLogout} className="logout-btn">Выйти</button>
                </header>

                <main className="dashboard-main" style={{ flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '40px' }}>
                    {/* Верхний блок с кнопками */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', width: '100%', justifyContent: 'space-evenly' }}>
                        <button className="action-btn side-btn completed">
                            Завершённые цели
                        </button>

                        <button className="action-btn create-btn" onClick={() => setIsModalOpen(true)}>
                            <span className="plus-icon">+</span>
                            Создать новую цель
                        </button>

                        <button className="action-btn side-btn active">
                            Активные цели
                        </button>
                    </div>

                    {/* Список целей */}
                    <div className="goals-list" style={{ width: '100%', maxWidth: '800px' }}>
                        <h3 style={{ color: 'white', marginBottom: '15px' }}>Ваши цели:</h3>
                        {goals.length === 0 ? (
                            <p style={{ color: '#888' }}>У вас пока нет целей. Создайте первую!</p>
                        ) : (
                            goals.map(goal => (
                                <div
                                    key={goal.id}
                                    onClick={() => setSelectedGoal(goal)}
                                    style={{
                                        background: '#2a2a2a',
                                        padding: '20px',
                                        borderRadius: '10px',
                                        marginBottom: '10px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#333'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#2a2a2a'}
                                >
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: 'white', fontSize: '18px' }}>{goal.title}</h4>
                                        <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>{goal.description}</p>
                                    </div>
                                    <div style={{ color: goal.progress === 100 ? '#2ecc71' : '#f1c40f', fontWeight: 'bold', fontSize: '20px' }}>
                                        {goal.progress}%
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>

                <footer className="dashboard-footer">
                    <p>{quote}</p>
                </footer>

                {/* МОДАЛЬНОЕ ОКНО ДЛЯ СОЗДАНИЯ ЦЕЛИ */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Создать новую цель</h3>
                            <form onSubmit={handleCreateGoal}>
                                <div className="input-group">
                                    <label>Название цели</label>
                                    <input
                                        type="text"
                                        value={newGoalTitle}
                                        onChange={(e) => setNewGoalTitle(e.target.value)}
                                        required
                                        placeholder="Например: Накопить на отпуск"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Описание (необязательно)</label>
                                    <input
                                        type="text"
                                        value={newGoalDesc}
                                        onChange={(e) => setNewGoalDesc(e.target.value)}
                                        placeholder="Краткое описание"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="submit" className="login-btn" style={{ backgroundColor: '#2ecc71' }}>Создать</button>
                                    <button type="button" className="login-btn" style={{ backgroundColor: '#e74c3c' }} onClick={() => setIsModalOpen(false)}>Отмена</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* МОДАЛЬНОЕ ОКНО ДЛЯ ПОДЦЕЛЕЙ */}
                {selectedGoal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px' }}>
                            <h3>{selectedGoal.title}</h3>
                            <p style={{ color: '#aaa', marginTop: '-10px', marginBottom: '20px' }}>{selectedGoal.description}</p>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#2ecc71' }}>Прогресс: {selectedGoal.progress}%</h4>
                                {/* Визуальный прогресс-бар */}
                                <div style={{ width: '100%', background: '#444', borderRadius: '10px', height: '10px' }}>
                                    <div style={{ width: `${selectedGoal.progress}%`, background: '#2ecc71', height: '100%', borderRadius: '10px', transition: 'width 0.3s' }}></div>
                                </div>
                            </div>

                            {/* Список подцелей */}
                            <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                                {selectedGoal.sub_goals.length === 0 ? (
                                    <p style={{ color: '#888' }}>Нет шагов. Добавьте первый!</p>
                                ) : (
                                    selectedGoal.sub_goals.map(sg => (
                                        <div key={sg.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', background: '#2a2a2a', padding: '10px', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={sg.completed}
                                                onChange={() => handleToggleSubGoal(sg.id)}
                                                style={{ marginRight: '15px', cursor: 'pointer', width: '18px', height: '18px' }}
                                            />
                                            <span style={{ color: sg.completed ? '#888' : 'white', textDecoration: sg.completed ? 'line-through' : 'none' }}>
                                                {sg.title}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Форма добавления подцели */}
                            <form onSubmit={handleCreateSubGoal} style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={newSubGoalTitle}
                                    onChange={(e) => setNewSubGoalTitle(e.target.value)}
                                    placeholder="Новый шаг..."
                                    required
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #444', background: '#1e1e1e', color: 'white' }}
                                />
                                <button type="submit" className="login-btn" style={{ width: 'auto', margin: 0, padding: '10px 20px', background: '#4a90e2' }}>Добавить</button>
                            </form>

                            <button
                                onClick={() => setSelectedGoal(null)}
                                className="logout-btn"
                                style={{ width: '100%', marginTop: '20px' }}
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ЭТО ФОРМА ВХОДА/РЕГИСТРАЦИИ (ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН)
    return (
        <div className="auth-container">
            <h2>{isRegistering ? 'Регистрация в Aim Tracker' : 'Вход в Aim Tracker'}</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="auth-form">
                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="example@test.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="login-btn">
                    {isRegistering ? 'Зарегистрироваться' : 'Войти'}
                </button>
            </form>

            <button
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setEmail('');
                    setPassword('');
                }}
                style={{ marginTop: '15px', background: 'none', border: 'none', color: '#4a90e2', cursor: 'pointer', textDecoration: 'underline' }}
            >
                {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
        </div>
    );
}

export default App;