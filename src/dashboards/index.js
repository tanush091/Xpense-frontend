// Picks the Home screen, calculations and extra pages for each account type.
// The account type comes from the signed-in user's profile, so each login lands on its own dashboard.
import { getPersonaConfig } from '../data/personas';
import { billService } from '../services/billService';
import { analyticsService } from '../services/analyticsService';
import StudentHome from './student/StudentHome';
import PersonalHome from './personal/PersonalHome';
import BusinessHome from './business/BusinessHome';
import BillsView from './personal/BillsView';
import PayeesView from './business/PayeesView';
import { computeStudentSummary } from './student/studentMetrics';
import { computePersonalSummary } from './personal/personalMetrics';
import { computeBusinessSummary } from './business/businessMetrics';

const DASHBOARDS = {
  student: {
    Home: StudentHome,
    computeSummary: computeStudentSummary,
    extraPages: {},
    loadExtras: async () => ({})
  },
  personal: {
    Home: PersonalHome,
    computeSummary: computePersonalSummary,
    extraPages: { bills: BillsView },
    loadExtras: async () => ({ bills: await billService.getBills() })
  },
  corporate: {
    Home: BusinessHome,
    computeSummary: computeBusinessSummary,
    extraPages: { payees: PayeesView },
    loadExtras: async () => {
      const [monthly, payees] = await Promise.all([
        analyticsService.getMonthlyTotals(6),
        analyticsService.getTopPayees({ limit: 5 })
      ]);
      return { monthly, payees };
    }
  }
};

export function getDashboard(accountType) {
  const persona = getPersonaConfig(accountType);
  return { persona, ...(DASHBOARDS[persona.id] || DASHBOARDS.student) };
}
