class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  # Метод для входа (Login)
  def create
    raw_body = request.body.read
    begin
      data = JSON.parse(raw_body)
    rescue JSON::ParserError
      return render json: { error: 'Ошибка формата JSON' }, status: :bad_request
    end

    email = data.dig('user', 'email') || data['email']
    password = data.dig('user', 'password') || data['password']

    user = User.find_by(email: email)

    if user && user.authenticate(password)
      # ИСПОЛЬЗУЕМ ОБЫЧНУЮ КУКУ ВМЕСТО SIGNED (обход бага Ruby 4.0)
      cookies[:user_id] = { value: user.id, httponly: true, same_site: :lax }
      render json: { logged_in: true, user: { id: user.id, email: user.email } }, status: :ok
    else
      render json: { logged_in: false, error: 'Неверный email или пароль' }, status: :unauthorized
    end
  end

  # Метод для проверки сессии (для F5)
  def logged_in
    # Читаем обычную куку
    user_id = cookies[:user_id]

    if user_id && User.exists?(user_id)
      user = User.find(user_id)
      render json: { logged_in: true, user: { id: user.id, email: user.email } }, status: :ok
    else
      render json: { logged_in: false }, status: :ok
    end
  end

  # Метод для выхода (Logout)
  def destroy
    cookies.delete(:user_id)
    render json: { logged_in: false, message: 'Вы успешно вышли' }, status: :ok
  end
end