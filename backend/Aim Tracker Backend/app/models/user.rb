class User < ApplicationRecord
  has_secure_password

  # Добавляем связь: у одного пользователя много целей.
  # dependent: :destroy означает, что при удалении юзера удалятся и его цели.
  has_many :goals, dependent: :destroy

  # Добавляем валидацию email, о которой говорили ранее
  validates :email, presence: true, uniqueness: true
end