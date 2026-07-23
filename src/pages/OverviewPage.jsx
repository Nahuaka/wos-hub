import { useAppData } from '../context/AppDataContext';
import StatCard from '../components/common/StatCard';
import TroopsSetup from '../components/overview/TroopsSetup';
import SnowApeCard from '../components/overview/SnowApeCard';
import furnaceIcon from '../assets/icons/furnace.png';

export default function OverviewPage() {
  const { currentAccount, patchCurrentAccount, events } = useAppData();
  if (!currentAccount) return null;

  const ongoingUnregistered = events.find((e) => !e.finished && e.status === 'unregistered');

  return (
    <div className="view active account-page-el">
      {ongoingUnregistered && (
        <div className="banner">
          <div className="banner-left">
            <div className="banner-dot" />
            <div>
              <div className="banner-title">Ongoing Event — {ongoingUnregistered.name}</div>
              <div className="banner-sub">{ongoingUnregistered.name} ongoing — please register to it</div>
            </div>
          </div>
          <button className="btn-primary">Register</button>
        </div>
      )}

      <div className="stat-grid">
        <StatCard
          label="TOTAL POWER"
          color="teal"
          value={currentAccount.power}
          editable
          onChange={(value) => patchCurrentAccount({ power: value })}
        />
        <StatCard
          label="MARCH CAPACITY"
          color="orange"
          value={currentAccount.march}
          editable
          onChange={(value) => patchCurrentAccount({ march: value })}
        />
        <StatCard
          label="FURNACE LEVEL"
          color="orange"
          value={currentAccount.furnace}
          editable
          icon={<img className="furnace-icon" src={furnaceIcon} alt="Furnace" />}
          onChange={(value) => patchCurrentAccount({ furnace: value })}
        />
      </div>

      <SnowApeCard />
      <TroopsSetup />
    </div>
  );
}
