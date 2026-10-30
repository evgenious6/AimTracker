module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # Берем ID из куки (так же, как мы делали в контроллерах)
      user_id = cookies[:user_id]
      if user_id && (user = User.find_by(id: user_id))
        user
      else
        reject_unauthorized_connection
      end
    end
  end
end
