class GoalsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  # GET /goals (Получить все цели текущего пользователя)
  def index
    if current_user
      # Берем цели пользователя, включаем подцели, чтобы не делать лишних запросов к БД
      goals = current_user.goals.includes(:sub_goals).map do |goal|
        {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          progress: goal.progress, # Вызываем наш бизнес-метод!
          sub_goals: goal.sub_goals # Отдаем подцели фронтенду
        }
      end
      render json: goals, status: :ok
    else
      render json: { error: 'Не авторизован' }, status: :unauthorized
    end
  end

  # POST /goals (Создать новую цель)
  def create
    # Читаем сырое тело запроса (обход бага Ruby 4.0)
    raw_body = request.body.read
    begin
      data = JSON.parse(raw_body)
    rescue JSON::ParserError
      return render json: { error: 'Ошибка формата JSON' }, status: :bad_request
    end

    if current_user
      goal = current_user.goals.new(
        title: data['title'],
        description: data['description'],
        completed: false
      )

      if goal.save
        render json: { status: 'created', goal: goal }, status: :ok
      else
        render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Не авторизован' }, status: :unauthorized
    end
  end
end