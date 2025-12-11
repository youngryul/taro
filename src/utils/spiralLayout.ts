/**
 * 나선형(Spiral) 레이아웃 계산 유틸리티
 */

export interface SpiralPosition {
  x: number;
  y: number;
  angle: number;
  scale: number;
  zIndex?: number;
}

/**
 * 아르키메데스 나선(Archimedean Spiral) 계산
 * @param totalCards 전체 카드 수
 * @param containerWidth 컨테이너 너비
 * @param containerHeight 컨테이너 높이
 * @returns 각 카드의 위치 배열
 */
export const calculateSpiralPositions = (
  totalCards: number,
  containerWidth: number = 800,
  containerHeight: number = 600
): SpiralPosition[] => {
  const positions: SpiralPosition[] = [];
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  // 나선 파라미터
  const maxRadius = Math.min(containerWidth, containerHeight) * 0.45;
  const rotations = 5; // 나선 회전 수
  const angleStep = (rotations * 2 * Math.PI) / totalCards;
  const radiusStep = maxRadius / totalCards;

  for (let i = 0; i < totalCards; i++) {
    const angle = i * angleStep;
    const radius = i * radiusStep;
    
    // 극좌표를 직교좌표로 변환
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // 중심에서 멀어질수록 카드 크기 감소
    const scale = 1 - (i / totalCards) * 0.3;
    
    positions.push({
      x,
      y,
      angle: (angle * 180) / Math.PI, // 라디안을 도로 변환
      scale,
    });
  }

  return positions;
};

/**
 * 팬(Fan) 형태 레이아웃 계산
 * 카드를 부채꼴 모양으로 펼침
 */
export const calculateFanPositions = (
  totalCards: number,
  containerWidth: number = 800,
  containerHeight: number = 600
): SpiralPosition[] => {
  const positions: SpiralPosition[] = [];
  const centerX = containerWidth / 2;
  const centerY = containerHeight * 0.85; // 하단 중심 (더 아래로)
  
  const radius = Math.min(containerWidth, containerHeight) * 0.75;
  const startAngle = -75; // 시작 각도 (더 넓게)
  const endAngle = 75; // 끝 각도 (더 넓게)
  const angleRange = endAngle - startAngle;
  
  for (let i = 0; i < totalCards; i++) {
    const progress = i / Math.max(totalCards - 1, 1);
    const angle = startAngle + angleRange * progress;
    const angleRad = (angle * Math.PI) / 180;
    
    const x = centerX + radius * Math.sin(angleRad);
    const y = centerY - radius * Math.cos(angleRad);
    
    positions.push({
      x,
      y,
      angle: angle + 90, // 카드가 중심을 향하도록 회전
      scale: 1,
    });
  }

  return positions;
};

/**
 * 원형(Circle) 레이아웃 계산
 */
export const calculateCirclePositions = (
  totalCards: number,
  containerWidth: number = 800,
  containerHeight: number = 600
): SpiralPosition[] => {
  const positions: SpiralPosition[] = [];
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  // 카드가 겹치지 않도록 반지름 조정
  // 카드 너비(60px)와 각도 간격을 고려하여 반지름 계산
  const cardWidth = 60;
  const minAngleStep = (2 * Math.PI) / totalCards;
  const minRadius = cardWidth / (2 * Math.sin(minAngleStep / 2));
  // 간격을 좁히기 위해 0.9배 적용
  const radius = Math.max(minRadius * 0.9, Math.min(containerWidth, containerHeight) * 0.32);
  
  const angleStep = (2 * Math.PI) / totalCards;
  
  for (let i = 0; i < totalCards; i++) {
    const angle = i * angleStep - Math.PI / 2; // -90도부터 시작
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // z-index: 위쪽 카드가 더 높게 (각도에 따라)
    // -90도(위)가 가장 높고, 90도(아래)가 가장 낮음
    const normalizedAngle = (angle + Math.PI / 2) % (2 * Math.PI);
    const zIndex = Math.round(100 + (normalizedAngle / (2 * Math.PI)) * 100);
    
    positions.push({
      x,
      y,
      angle: 0, // 카드는 세로로 서 있음
      scale: 0.85, // 약간 작게 하여 겹침 최소화
      zIndex,
    });
  }

  return positions;
};

/**
 * 다층 부채꼴 레이아웃 계산 (좌우 방향 - 이미지 스타일)
 * 카드를 2-3개 레이어로 나누어 좌우로 부채꼴 모양으로 배치
 */
export const calculateMultiLayerFanPositions = (
  totalCards: number,
  containerWidth: number = 800,
  containerHeight: number = 600,
  layers: number = 2
): SpiralPosition[] => {
  const positions: SpiralPosition[] = [];
  const centerX = containerWidth / 2; // 가로 중앙
  const centerY = containerHeight * 0.75; // 하단 중심
  
  // 레이어별 카드 수 계산
  const cardsPerLayer = Math.ceil(totalCards / layers);
  
  for (let i = 0; i < totalCards; i++) {
    const layerIndex = Math.floor(i / cardsPerLayer);
    const cardInLayer = i % cardsPerLayer;
    const cardsInThisLayer = Math.min(cardsPerLayer, totalCards - layerIndex * cardsPerLayer);
    
    // 레이어별 설정
    const layerOffset = layerIndex * 0.15;
    const baseRadius = Math.min(containerWidth, containerHeight) * 0.65;
    const radius = baseRadius * (1 - layerOffset);
    
    // 좌우 방향 각도 범위 (이미지처럼 넓게)
    const baseAngleRange = 120;
    const angleRange = baseAngleRange + (layerIndex * 15);
    const startAngle = -angleRange / 2; // 왼쪽
    const endAngle = angleRange / 2; // 오른쪽
    
    // 이 레이어 내에서의 위치
    const progress = cardsInThisLayer > 1 ? cardInLayer / (cardsInThisLayer - 1) : 0.5;
    const angle = startAngle + (endAngle - startAngle) * progress;
    const angleRad = (angle * Math.PI) / 180;
    
    const x = centerX + radius * Math.sin(angleRad);
    const y = centerY - radius * Math.cos(angleRad);
    
    // 레이어별 스케일 (뒤쪽 레이어가 약간 작게)
    const scale = 0.75 - (layerIndex * 0.1);
    
    // 카드 회전 각도: 세로로 서 있도록 (회전 없음)
    // 이미지처럼 카드는 항상 세로로 서 있고, 위치만 부채꼴로 배치
    const cardRotation = 0;
    
    positions.push({
      x,
      y,
      angle: cardRotation,
      scale,
    });
  }

  return positions;
};

