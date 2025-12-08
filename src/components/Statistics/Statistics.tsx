import React from 'react';
import './Statistics.css';

/**
 * 지난 30일 통계 UI 컴포넌트
 * 좋은 흐름 / 나쁜 흐름을 나타내는 부드러운 곡선 그래프를 표시합니다.
 */
export const Statistics: React.FC = () => {
  // 샘플 데이터 (실제로는 props나 state로 받아올 수 있음)
  const goodFlowData = [65, 70, 68, 75, 72, 78, 80, 82, 85, 83, 88, 90, 87, 92, 90, 88, 85, 90, 92, 95, 93, 90, 88, 85, 87, 90, 92, 95, 98, 96];
  const badFlowData = [35, 30, 32, 25, 28, 22, 20, 18, 15, 17, 12, 10, 13, 8, 10, 12, 15, 10, 8, 5, 7, 10, 12, 15, 13, 10, 8, 5, 2, 4];

  // SVG 경로 생성 (부드러운 곡선 - Catmull-Rom 스플라인 근사)
  const generateSmoothPath = (data: number[]) => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - value; // Y축 반전 (상단이 0)
      return { x, y };
    });

    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const prev = i > 0 ? points[i - 1] : current;
      const after = i < points.length - 2 ? points[i + 2] : next;
      
      // 제어점 계산 (부드러운 곡선을 위한)
      const cp1x = current.x + (next.x - prev.x) / 6;
      const cp1y = current.y + (next.y - prev.y) / 6;
      const cp2x = next.x - (after.x - current.x) / 6;
      const cp2y = next.y - (after.y - current.y) / 6;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  const goodPath = generateSmoothPath(goodFlowData);
  const badPath = generateSmoothPath(badFlowData);

  return (
    <section className="statistics">
      <h2 className="statistics__title">지난 30일 통계</h2>
      <div className="statistics__container">
        <div className="statistics__chart">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="statistics__svg"
          >
            <defs>
              <linearGradient id="goodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#558972" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#558972" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="badGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E8D5C4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#E8D5C4" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* 좋은 흐름 영역 */}
            <path
              d={`${goodPath} L 100 100 L 0 100 Z`}
              fill="url(#goodGradient)"
              className="statistics__area"
            />
            
            {/* 나쁜 흐름 영역 */}
            <path
              d={`${badPath} L 100 100 L 0 100 Z`}
              fill="url(#badGradient)"
              className="statistics__area"
            />
            
            {/* 좋은 흐름 라인 */}
            <path
              d={goodPath}
              fill="none"
              stroke="#558972"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="statistics__line statistics__line--good"
            />
            
            {/* 나쁜 흐름 라인 */}
            <path
              d={badPath}
              fill="none"
              stroke="#E8D5C4"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="statistics__line statistics__line--bad"
            />
          </svg>
        </div>
        
        <div className="statistics__legend">
          <div className="statistics__legend-item">
            <div className="statistics__legend-color statistics__legend-color--good"></div>
            <span className="statistics__legend-label">좋은 흐름</span>
          </div>
          <div className="statistics__legend-item">
            <div className="statistics__legend-color statistics__legend-color--bad"></div>
            <span className="statistics__legend-label">나쁜 흐름</span>
          </div>
        </div>
      </div>
    </section>
  );
};

