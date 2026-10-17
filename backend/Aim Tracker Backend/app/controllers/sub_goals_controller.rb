class SubGoalsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  def create
    raw_body = request.body.read
    request.body.rewind

    begin
      data = JSON.parse(raw_body)
    rescue JSON::ParserError
      return render json: { error: 'Ошибка формата JSON' }, status: :bad_request
    end

    if current_user
      goal = current_user.goals.find_by(id: data['goal_id'])

      if goal
        sub_goal = goal.sub_goals.new(title: data['title'], completed: false)
        if sub_goal.save
          render json: { status: 'created', sub_goal: sub_goal }, status: :ok
        else
          render json: { errors: sub_goal.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Цель не найдена' }, status: :not_found
      end
    else
      render json: { error: 'Не авторизован' }, status: :unauthorized
    end
  end

  def toggle
    raw_body = request.body.read
    request.body.rewind

    begin
      data = JSON.parse(raw_body)
    rescue JSON::ParserError
      return render json: { error: 'Ошибка формата JSON' }, status: :bad_request
    end

    if current_user
      sub_goal = SubGoal.joins(:goal).where(goals: { user_id: current_user.id }).find_by(id: data['id'])

      if sub_goal
        sub_goal.update(completed: !sub_goal.completed)
        render json: {
          sub_goal: sub_goal,
          goal_progress: sub_goal.goal.progress
        }, status: :ok
      else
        render json: { error: 'Подцель не найдена' }, status: :not_found
      end
    else
      render json: { error: 'Не авторизован' }, status: :unauthorized
    end
  end
end