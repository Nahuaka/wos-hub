import { useAppData } from '../context/AppDataContext';
import StatCard from '../components/common/StatCard';
import PetCard from '../components/rally/PetCard';
import ExpertCard from '../components/rally/ExpertCard';
import GearCard from '../components/rally/GearCard';
import CharmCard from '../components/rally/CharmCard';

export default function RallyLeadPage() {
  const { currentAccount, patchCurrentAccountJson } = useAppData();
  if (!currentAccount) return null;

  const rally = currentAccount.rally || {};

  function updateRallyField(field, value) {
    patchCurrentAccountJson('rally', (prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="view active account-page-el">
      <div className="stat-grid two">
        <StatCard
          label="RALLY CAPACITY"
          color="teal"
          large
          value={rally.rallyCap || '0'}
          editable
          onChange={(v) => updateRallyField('rallyCap', v)}
        />
        <StatCard
          label="ISLAND SCORE"
          color="orange"
          large
          value={rally.islandScore || '0'}
          editable
          onChange={(v) => updateRallyField('islandScore', v)}
        />
      </div>

      <div className="stat-grid">
        <StatCard
          label="PET POWER"
          color="purple"
          value={rally.petPower || '0'}
          editable
          onChange={(v) => updateRallyField('petPower', v)}
        />
        <StatCard
          label="EXPERT POWER"
          color="purple"
          value={rally.expertPower || '0'}
          editable
          onChange={(v) => updateRallyField('expertPower', v)}
        />
        <StatCard
          label="TECH POWER"
          color="teal"
          value={rally.techPower || '0'}
          editable
          onChange={(v) => updateRallyField('techPower', v)}
        />
      </div>

      <PetCard />
      <ExpertCard />
      <GearCard />
      <CharmCard />
    </div>
  );
}
