import { useAppData } from '../../context/AppDataContext';
import { SNOW_APE_IMAGE } from '../../data/petDefs';
import LevelSelect from '../common/LevelSelect';

export default function SnowApeCard() {
  const { currentAccount, patchCurrentAccount } = useAppData();
  if (!currentAccount) return null;

  return (
    <>
      <div className="section-title-row">
        <div className="section-title">
          <span className="section-icon purple">&#128062;</span>SNOW APE
        </div>
      </div>
      <div className="card card-accent card-accent-purple">
        <div className="snow-ape-row">
          <div className="snow-ape-icon">
            <img src={SNOW_APE_IMAGE} alt="Snow Ape" />
          </div>
          <div className="snow-ape-info">
            <div className="pet-name">Snow Ape</div>
            <div className="pet-desc">Boost march capacity</div>
          </div>
          <LevelSelect
            className="pet-level-select snow-ape-select"
            min={1}
            max={10}
            value={currentAccount.snow_ape_level}
            onChange={(level) => patchCurrentAccount({ snow_ape_level: level })}
          />
        </div>
      </div>
    </>
  );
}
