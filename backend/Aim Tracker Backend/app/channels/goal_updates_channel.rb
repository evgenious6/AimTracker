class GoalUpdatesChannel < ApplicationCable::Channel
  def subscribed
    # Подписываем пользователя на его личный канал.
    # Никто чужой не сможет перехватить эти сообщения.
    stream_from "goal_updates_#{current_user.id}"
  end

  def unsubscribed
    # Любая очистка при отписке
  end
end