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

    // Проверяем авторизацию при загрузке страницы
    useEffect(() => {
        axios.get(`${API_URL}/logged_in`, { withCredentials: true })
            .then(response => {
                if (response.data.logged_in) {
                    setUser(response.data.user)
                }
            })
            .catch(err => console.log('Ошибка проверки сессии:', err))
    }, [])
    // Выбираем случайную фразу при загрузке
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        setQuote(MOTIVATIONAL_QUOTES[randomIndex]);
    }, []);

    // Вход
    const handleLogin = (e) => {
        e.preventDefault()
        setError('')

        // Обратите внимание на обертку "user"
        axios.post(`${API_URL}/login`, {
            user: {
                email: email,
                password: password
            }
        })
            .then(response => {
                if (response.data.logged_in) {
                    setUser(response.data.user)
                }
            })
            .catch(err => {
                if (err.response && err.response.data.error) {
                    setError(err.response.data.error)
                } else {
                    setError('Произошла ошибка при подключении к серверу')
                }
            })
    };
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
        // ИСПРАВЛЕНО: путь /logout вместо /api/logout, порт 3000
        axios.delete(`${API_URL}/logout`)
            .then(() => {
                setUser(null)
                setEmail('')
                setPassword('')
            })
            .catch(err => console.log('Ошибка выхода:', err))
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

                <main className="dashboard-main">
                    <button className="action-btn side-btn completed">
                        Завершённые цели
                    </button>

                    <button className="action-btn create-btn">
                        <span className="plus-icon">+</span>
                        Создать новую цель
                    </button>

                    <button className="action-btn side-btn active">
                        Активные цели
                    </button>
                </main>

                <footer className="dashboard-footer">
                    <p>{quote}</p>
                </footer>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <h2>{isRegistering ? 'Регистрация в Aim Tracker' : 'Вход в Aim Tracker'}</h2>

            {error && <div className="error-message">{error}</div>}

            {/* Форма отправляет данные в handleRegister или handleLogin в зависимости от режима */}
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

            {/* Кнопка переключения режимов */}
            <button
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setEmail('');
                    setPassword('');
                }}
                style={{ marginTop: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            >
                {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
        </div>
    )};
export default App