import React, { useState } from 'react';
import './TarotAdvice.css';

/**
 * 타로 조언 + To-Do 리스트 컴포넌트
 * 카드 해석 섹션과 미니 체크리스트를 포함합니다.
 */
export const TarotAdvice: React.FC = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: '오늘은 자신을 돌보는 시간을 가져보세요', completed: false },
    { id: 2, text: '작은 감사한 일을 세 가지 적어보세요', completed: false },
    { id: 3, text: '깊게 숨을 들이쉬고 내면의 평화를 느껴보세요', completed: false },
  ]);

  const handleToggleTodo = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <section className="tarot-advice">
      <div className="tarot-advice__card-interpretation">
        <h3 className="tarot-advice__title">카드 해석</h3>
        <p className="tarot-advice__interpretation-text">
          오늘은 변화의 기운이 느껴지는 날입니다. 과거에 얽매이지 말고,
          현재의 순간을 소중히 여기며 미래를 향해 한 걸음씩 나아가세요.
          작은 실천이 큰 변화를 만들어낼 거예요.
        </p>
      </div>

      <div className="tarot-advice__todo-section">
        <h4 className="tarot-advice__todo-title">오늘의 힐링 체크리스트</h4>
        <ul className="tarot-advice__todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="tarot-advice__todo-item">
              <label className="tarot-advice__todo-label">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="tarot-advice__todo-checkbox"
                />
                <span
                  className={`tarot-advice__todo-text ${
                    todo.completed ? 'tarot-advice__todo-text--completed' : ''
                  }`}
                >
                  {todo.text}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

