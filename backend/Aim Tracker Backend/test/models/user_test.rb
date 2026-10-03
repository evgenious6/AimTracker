require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "Пользователь не должен сохраняться без email" do
    user = User.new(password: "password123")
    assert_not user.save, "Система сохранила пользователя без email!"
  end

  test "Пользователь не должен сохраняться с дублирующимся email" do
    User.create(email: "test@test.com", password: "password123")
    duplicate_user = User.new(email: "test@test.com", password: "password456")
    assert_not duplicate_user.save, "Система сохранила пользователя с уже существующим email!"
  end
end
