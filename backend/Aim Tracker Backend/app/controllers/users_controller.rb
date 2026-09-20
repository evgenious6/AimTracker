class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  def create
    # Читаем сырое тело запроса (обход бага Ruby 4.0)
    raw_body = request.body.read
    begin
      data = JSON.parse(raw_body)
    rescue JSON::ParserError
      return render json: { error: 'Ошибка формата JSON' }, status: :bad_request
    end

    email = data.dig('user', 'email') || data['email']
    password = data.dig('user', 'password') || data['password']

    # Создаем нового пользователя
    user = User.new(
      email: email,
      password: password,
      password_confirmation: password
    )

    if user.save
      render json: { status: 'created', message: 'Пользователь успешно создан' }, status: :ok
    else
      # Если есть ошибки (например, email уже занят или пароль слишком короткий)
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end