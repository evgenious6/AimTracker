require "test_helper"

class SubGoalTest < ActiveSupport::TestCase
  def setup
    @user = User.create(email: "test@test.com", password: "password123")
    @goal = @user.goals.create(title: "Накопить миллион")
  end

  test "sub_goal should not save without title" do
    sub_goal = SubGoal.new(completed: false, goal: @goal)
    assert_not sub_goal.save, "Система сохранила подцель без названия!"
  end

  test "sub_goal should not save without parent goal" do
    sub_goal = SubGoal.new(title: "Накопить 100к")
    assert_not sub_goal.save, "Система сохранила подцель без привязки к цели!"
  end

  test "sub_goal should save with valid data" do
    sub_goal = SubGoal.new(title: "Накопить 100к", goal: @goal)
    assert sub_goal.save, "Система не смогла сохранить корректную подцель!"
  end

  test "deleting goal deletes its sub_goals" do
    @goal.sub_goals.create(title: "Шаг 1")
    @goal.sub_goals.create(title: "Шаг 2")

    assert_difference("SubGoal.count", -2) do
      @goal.destroy
    end
  end
end
