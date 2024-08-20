const DECISION_THRESHOLD = 75;
let isAnimating = false; // flag para saber si se esta animando
let pullDeltaX = 0; //distancia que la card se está arrastrando

function starDrag(e) {
 if (isAnimating) return;
  // Obtenemos el elemento article más cercano 
  const actualCard = event.target.closest('article');
  if (!actualCard) return;
  // Obtenemos la posición inicial del mouse o dedo
  const startX = event.pageX ?? event.touches[0].pageX;
  // escuchar el movimiento del mouse o dedos
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);

  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('touchend', onEnd, { passive: true });

  function onMove(event) {
    // current position of mouse or finger
    const currentX = event.pageX ?? event.touches[0].pageX;

    // the distance between the initial and current position
    pullDeltaX = currentX - startX;

    // there is no distance traveled in X axis
    if (pullDeltaX === 0) return;

    // change the flag to indicate we are animating
    isAnimating = true;

    // calculate the rotation of the card using the distance
    const deg = pullDeltaX / 14;

    // apply the transformation to the card
    actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`;

    // change the cursor to grabbing
    actualCard.style.cursor = 'grabbing';
    // 
    const opacity = Math.abs(pullDeltaX) / 100;
    const isRight = pullDeltaX > 0;

    const choiceEl = isRight
      ? actualCard.querySelector('.choice.like')
      : actualCard.querySelector('.choice.nope')
    choiceEl.style.opacity = opacity;
  }

  function onEnd(event) {
    //  limpiar eventListener
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);

    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);

    // Saber si el usuario tomo una decisión
    const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD;

    if (decisionMade) {
      const goRight = pullDeltaX >= 0;

      actualCard.classList.add(goRight ? 'go-right' : 'go-left');
      actualCard.addEventListener('transitionend', () => {
        actualCard.remove();
      });
    } else {
      actualCard.classList.add('reset');
      actualCard.classList.remove('go-right', 'go-left');
      actualCard.querySelectorAll('.choice').forEach(choice => {
        choice.style.opacity = 0
      })
    }

    // resetemos las variables
    actualCard.addEventListener('transitionend', () => {
      actualCard.removeAttribute('style');
      actualCard.classList.remove('reset');
      pullDeltaX = 0;
      isAnimating = false;
    })
    // reset the choice info opacity
    actualCard
      .querySelectorAll(".choice")
      .forEach((el) => (el.style.opacity = 0));
  }
}

document.addEventListener('mousedown', starDrag);
document.addEventListener('touchstart', starDrag, { passive: true });