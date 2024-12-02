import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  frequency: number;
  isLoading: boolean;
  isPlayingAudio: boolean;
}

const StrawberryAnimation = ({
  frequency,
  isLoading,
  isPlayingAudio,
}: Props) => {
  const defaultHeight = 1;
  const newHeight = isPlayingAudio
    ? 0.6 + (frequency / 100) * (1.2 - 0.6)
    : defaultHeight;

  const newBottom = (frequency / 100) * (10 - -10) - 10;
  const newBorderRadius = isPlayingAudio ? (frequency / 100) * 100 : '50';

  return (
    <div
      className={twMerge(
        'centerwrap-straw relative scale-75 top-10 lg:top-0 lg:scale-100'
      )}
    >
      <svg
        width="38"
        height="26"
        viewBox="0 0 38 26"
        fill="none"
        className="absolute w-40 h-40 z-20 -top-20 left-20 rotate-12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.6116 3.65347C18.6116 3.65347 21.7212 8.74214 21.8101 12.72C21.9173 17.5143 18.156 20.6531 18.156 20.6531C18.156 20.6531 15.3756 17.0469 15.5112 11.9896C15.6155 8.09934 18.6116 3.65347 18.6116 3.65347Z"
          fill="#519B07"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.8871 2.26307L18.6116 3.65347L16.4003 2.16321C16.9076 1.41041 17.7632 0.967341 18.6709 0.987474C19.5785 1.00774 20.4136 1.48827 20.8871 2.26307ZM17.0817 6.40214C17.8501 4.78334 18.6116 3.65347 18.6116 3.65347C18.6116 3.65347 19.3128 4.80107 20.0588 6.43227C20.8837 8.23601 21.7635 10.6312 21.8101 12.72C21.8648 15.1657 20.9127 17.1807 19.9668 18.5679C19.0585 19.8999 18.1559 20.6531 18.1559 20.6531C18.1559 20.6531 17.4733 19.7677 16.8011 18.2591C16.1165 16.7231 15.4428 14.5411 15.5111 11.9897C15.5628 10.0605 16.3257 7.99467 17.0817 6.40214ZM18.1559 20.6531C16.044 22.2813 16.0435 22.2807 16.0429 22.2799L16.0417 22.2783L16.0391 22.2749L16.0331 22.2671L16.018 22.2472C16.0067 22.2321 15.9928 22.2135 15.9764 22.1912C15.9437 22.1467 15.9012 22.0879 15.8504 22.0151C15.7489 21.8699 15.6139 21.6685 15.4571 21.4156C15.1443 20.9109 14.7403 20.1929 14.3437 19.2963C13.5555 17.5133 12.7641 14.9491 12.8455 11.9183C12.9127 9.40894 13.8812 6.91801 14.6936 5.21481C15.116 4.32907 15.5333 3.58081 15.8467 3.05134C16.0039 2.78547 16.1364 2.57214 16.2324 2.42134C16.2804 2.34587 16.3193 2.28574 16.3477 2.24241L16.3824 2.18987L16.3935 2.17334L16.3973 2.16747L16.4003 2.16321C16.4005 2.16281 16.4003 2.16321 18.6116 3.65347C20.8871 2.26307 20.8868 2.26267 20.8871 2.26307L20.8895 2.26694L20.8929 2.27281L20.9033 2.29001L20.9371 2.34614C20.9651 2.39321 21.004 2.45894 21.0521 2.54214C21.1485 2.70827 21.2827 2.94427 21.4421 3.23787C21.76 3.82307 22.1843 4.64707 22.6132 5.60961C23.4353 7.45427 24.4193 10.1213 24.4761 12.6604C24.5459 15.7824 23.3556 18.3009 22.2388 19.9684C21.6751 20.81 21.1077 21.4696 20.6747 21.9251C20.4571 22.154 20.2704 22.3345 20.1307 22.4641C20.0607 22.5291 20.0023 22.5813 19.9573 22.6208C19.9348 22.6405 19.9157 22.6571 19.9001 22.6704L19.8796 22.6879L19.8713 22.6948L19.8677 22.6979L19.866 22.6992C19.8652 22.6999 19.8644 22.7005 18.1559 20.6531ZM16.044 22.2813L18.1559 20.6531L19.8644 22.7005C19.3077 23.1652 18.5859 23.3829 17.8651 23.3039C17.1443 23.2248 16.4868 22.8556 16.044 22.2813Z"
          fill="#156319"
        />
        <path
          d="M2.78522 11.5057C2.78522 11.5057 8.74775 11.6209 12.1491 13.6852C16.2487 16.1733 16.8719 21.0325 16.8719 21.0325C16.8719 21.0325 12.3364 21.4371 8.14575 18.6029C4.92201 16.4228 2.78522 11.5057 2.78522 11.5057Z"
          fill="#70CA16"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.83667 8.83961L2.7852 11.5057L0.339469 12.5687C-0.0223976 11.736 0.0642699 10.7764 0.56947 10.022C1.07467 9.26761 1.92893 8.82214 2.83667 8.83961Z"
          fill="#156319"
        />
      </svg>

      <div className="face-straw">
        <div className="-rotate-45 h-full w-full flex flex-col items-center gap-y-8 scale-[0.8] relative -top-2 -left-2">
          <div
            className="eyes-straw-2"
            style={{
              bottom: `${newBottom}px`,
              transition: 'linear',
            }}
          >
            <div className="eye-straw-2 relative">
              <div className="blink delay-75"></div>
            </div>
            <div className="eye-straw-2">
              <div className="blink"></div>
            </div>
          </div>
          <div
            className="blush"
            style={{
              scale: `${newHeight}`,
              transition: 'linear',
            }}
          ></div>
          <div
            className="blush right"
            style={{
              scale: `${newHeight}`,
              transition: 'linear',
            }}
          ></div>
          <div
            className="mouth-straw flex-shrink-0"
            style={{
              scale: `${newHeight}`,
              bottom: `${newBottom}px`,
              transition: 'linear',
              '--border-radius': `${newBorderRadius}%`,
            } as any}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StrawberryAnimation;
