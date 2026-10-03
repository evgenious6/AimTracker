class Goal < ApplicationRecord
  belongs_to :user
  has_many :sub_goals, dependent: :destroy

  validates :title, presence: true

  def progress
    return 0 if sub_goals.empty?
    completed_count = sub_goals.where(completed: true).count
    ((completed_count.to_f / sub_goals.count) * 100).round
  end
end

