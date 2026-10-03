# frozen_string_literal: true

require 'minitest/autorun'

class GoalTest < ActiveSupport::TestCase
  def setup
    @user = User.create(email: "test_user@test.com", password: "password123")
  end

  test "goal should not save without title" do
    goal = Goal.new(description: "Test description", user: @user)
    assert_not goal.save, "Goal was saved without a title!"
  end

  test "goal should save with valid data" do
    goal = Goal.new(title: "Save a million", user: @user)
    assert goal.save, "Goal was not saved with valid data!"
  end

  test "progress is 0 when there are no sub_goals" do
    goal = @user.goals.create(title: "Test goal")
    assert_equal 0, goal.progress
  end

  test "progress is 50 when 1 of 2 sub_goals is completed" do
    goal = @user.goals.create(title: "Test goal")
    goal.sub_goals.create(title: "Step 1", completed: true)
    goal.sub_goals.create(title: "Step 2", completed: false)
    assert_equal 50, goal.progress
  end
end
