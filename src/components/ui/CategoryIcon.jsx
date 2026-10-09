import React from 'react';
import {
  UtensilsCrossed,
  Bus,
  Popcorn,
  BookOpen,
  Home,
  ShoppingBag,
  User,
  Wallet,
  ArrowDownLeft,
  Send,
  HeartPulse,
  Plane,
  Laptop,
  PiggyBank,
  GraduationCap
} from 'lucide-react';

const RULES = [
  [/food|dining|canteen|mess|cafe|coffee|grocer/i, UtensilsCrossed, 'c1'],
  [/transport|transit|travel pass|metro|bus|cab|auto/i, Bus, 'c2'],
  [/entertain|fun|hangout|movie|leisure/i, Popcorn, 'c4'],
  [/book|education|study|xerox|photocopy|exam|course/i, BookOpen, 'c3'],
  [/hostel|rent|housing|utilit|laundry|bill/i, Home, 'c2'],
  [/shop|retail|cloth/i, ShoppingBag, 'c5'],
  [/health|medic|wellness/i, HeartPulse, 'c5'],
  [/trip|vacation|holiday/i, Plane, 'c2'],
  [/laptop|tablet|phone|tech/i, Laptop, 'c4'],
  [/emergency|saving|fund|reserve/i, PiggyBank, 'c1'],
  [/fee|tuition|semester/i, GraduationCap, 'c3'],
  [/income|allowance|pocket money|salary|stipend|scholar|received/i, ArrowDownLeft, 'c1'],
  [/transfer/i, Send, 'c6'],
  [/personal/i, User, 'c6']
];

export function resolveCategory(text = '') {
  for (const [re, Icon, tone] of RULES) {
    if (re.test(text)) return { Icon, tone };
  }
  return { Icon: Wallet, tone: 'c6' };
}

/** Soft tinted square with a category icon (DESIGN §7 Wallets). */
export default function CategoryIcon({ category, name, size = 40, income = false }) {
  const { Icon, tone } = income ? { Icon: ArrowDownLeft, tone: 'c1' } : resolveCategory(`${category || ''} ${name || ''}`);
  return (
    <span className={`x-cat x-cat-${tone}`} style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.45)} strokeWidth={1.75} />
    </span>
  );
}
