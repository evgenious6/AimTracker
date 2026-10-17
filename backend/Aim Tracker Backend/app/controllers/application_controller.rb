class ApplicationController < ActionController::API
  include ActionController::Cookies

  private

  # Этот метод будет доступен во всех контроллерах
  def current_user
    @current_user ||= User.find_by(id: cookies[:user_id])
  end
end