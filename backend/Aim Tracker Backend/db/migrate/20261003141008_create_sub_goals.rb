class CreateSubGoals < ActiveRecord::Migration[8.1]
  def change
    create_table :sub_goals do |t|
      t.string :title
      t.boolean :completed
      t.references :goal, null: false, foreign_key: true

      t.timestamps
    end
  end
end
