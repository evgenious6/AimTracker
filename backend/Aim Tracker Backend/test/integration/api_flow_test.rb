require "test_helper"

class ApiFlowTest < ActionDispatch::IntegrationTest
  def setup
    # Создаем тестового пользователя в базе перед каждым тестом
    @user = User.create!(email: "integration@test.com", password: "password123")
    @headers = { "Content-Type" => "application/json" }
  end

  # ==========================================
  # ЧАСТЬ 1: HAPPY PATH (Счастливый путь)
  # ==========================================

  test "Happy Path 1: Регистрация нового пользователя" do
    # Отправляем POST запрос на /register
    post "/register",
         params: { user: { email: "newuser@test.com", password: "password123" } }.to_json,
         headers: @headers

    assert_response :success
    assert_equal "created", JSON.parse(response.body)["status"]
    assert User.exists?(email: "newuser@test.com"), "Пользователь не создался в БД"
  end

  test "Happy Path 2: Успешный вход (Login)" do
    post "/login",
         params: { user: { email: @user.email, password: "password123" } }.to_json,
         headers: @headers

    assert_response :success
    # Проверяем, что в ответе пришло logged_in: true
    assert JSON.parse(response.body)["logged_in"]
    # Проверяем, что сервер установил куку (Set-Cookie)
    assert response.headers["Set-Cookie"].present?
  end

  test "Happy Path 3: Проверка сессии (F5)" do
    # Имитируем авторизованного пользователя (передаем куку вручную)
    get "/logged_in", headers: @headers.merge({ "Cookie" => "user_id=#{@user.id}" })

    assert_response :success
    assert JSON.parse(response.body)["logged_in"]
    assert_equal @user.email, JSON.parse(response.body)["user"]["email"]
  end

  test "Happy Path 4: Создание новой цели" do
    post "/goals",
         params: { title: "Тестовая цель", description: "Описание" }.to_json,
         headers: @headers.merge({ "Cookie" => "user_id=#{@user.id}" })

    assert_response :success
    assert_equal "created", JSON.parse(response.body)["status"]
    assert_equal 1, @user.goals.count, "Цель не привязалась к пользователю"
  end

  test "Happy Path 5: Получение списка своих целей" do
    @user.goals.create!(title: "Моя цель", description: "Текст")

    get "/goals", headers: @headers.merge({ "Cookie" => "user_id=#{@user.id}" })

    assert_response :success
    goals_data = JSON.parse(response.body)
    assert_equal 1, goals_data.length
    assert_equal "Моя цель", goals_data[0]["title"]
    assert_equal 0, goals_data[0]["progress"] # Прогресс пока 0
  end

  test "Happy Path 6: Создание подцели" do
    goal = @user.goals.create!(title: "Моя цель")

    post "/sub_goals",
         params: { goal_id: goal.id, title: "Первый шаг" }.to_json,
         headers: @headers.merge({ "Cookie" => "user_id=#{@user.id}" })

    assert_response :success
    assert_equal "created", JSON.parse(response.body)["status"]
    assert_equal 1, goal.sub_goals.count, "Подцель не создалась"
  end

  test "Happy Path 7: Отметка подцели и пересчет прогресса" do
    goal = @user.goals.create!(title: "Моя цель")
    sub_goal = goal.sub_goals.create!(title: "Первый шаг", completed: false)

    patch "/sub_goals/toggle",
          params: { id: sub_goal.id }.to_json,
          headers: @headers.merge({ "Cookie" => "user_id=#{@user.id}" })

    assert_response :success
    response_data = JSON.parse(response.body)

    assert response_data["sub_goal"]["completed"], "Статус не изменился на true"
    assert_equal 100, response_data["goal_progress"], "Прогресс не пересчитался на 100%"
  end

  # ==========================================
  # ЧАСТЬ 2: ОТВЕТВЛЕНИЯ (Негативные сценарии)
  # ==========================================

  test "Branch 1: Отказ в доступе без авторизации" do
    # Пытаемся получить цели без куки
    get "/goals", headers: @headers

    assert_response :unauthorized # 401
    assert_equal "Не авторизован", JSON.parse(response.body)["error"]
  end

  test "Branch 2: Попытка изменить чужую цель (Безопасность)" do
    # Создаем Второго пользователя (Хакера)
    hacker = User.create!(email: "hacker@test.com", password: "password123")
    # Создаем цель для Первого пользователя
    victim_goal = @user.goals.create!(title: "Секретная цель")

    # Хакер пытается добавить подцель в чужую цель
    post "/sub_goals",
         params: { goal_id: victim_goal.id, title: "Взлом" }.to_json,
         headers: @headers.merge({ "Cookie" => "user_id=#{hacker.id}" })

    assert_response :not_found # 404
    assert_equal "Цель не найдена", JSON.parse(response.body)["error"]
    assert_equal 0, victim_goal.sub_goals.count, "Подцель все-таки создалась!"
  end

  test "Branch 3: Ошибка валидации (пустое название)" do
    # Пытаемся создать цель без названия
    post "/goals",
         params: { title: "", description: "Описание" }.to_json,
         headers: @headers.merge({ "Cookie" => "user_id=#{@user.id}" })

    assert_response :unprocessable_entity # 422
    assert JSON.parse(response.body)["errors"].present?, "Нет массива ошибок в ответе"
    assert_equal 0, @user.goals.count, "Сломанная цель сохранилась в БД"
  end
end