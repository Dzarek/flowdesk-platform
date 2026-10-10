import CalendarWidget from "@/components/dashboard/CalendarWidget";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import EnergyWidget from "@/components/dashboard/EnergyWidget";
import HealthWidget from "@/components/dashboard/HealthWidget";
import ShoppingWidget from "@/components/dashboard/ShoppingWidget";
import TasksWidget from "@/components/dashboard/TasksWidget";

import {
  MdOutlineCalendarMonth,
  MdOutlineChecklist,
  MdOutlineShoppingCart,
  MdOutlineSolarPower,
} from "react-icons/md";

export const welcomeData = {
  user: {
    firstName: "Jarek",
  },

  weather: {
    temperature: 24,
    icon: "sun",
  },

  summary: {
    events: 2,
    tasks: 5,
    shopping: 8,
  },

  ai: {
    text: "Dzisiaj nie masz zaplanowanych wydarzeń. To dobry moment, aby dokończyć zaległe zadania.",
  },
};

export const calendarEvents = [
  {
    id: 1,
    title: "Dentysta",
    time: "15:30",
  },
  {
    id: 2,
    title: "Trening Oli",
    time: "18:00",
  },
  {
    id: 3,
    title: "Kolacja z rodzicami",
    time: "20:00",
  },
  {
    id: 4,
    title: "Spacer z psem",
    time: "21:00",
  },
];

export const tasks = [
  {
    id: 1,
    title: "Zapłacić rachunek za prąd",
    dueDate: "Dzisiaj",
    completed: false,
  },
  {
    id: 2,
    title: "Zadzwonić do dentysty",
    dueDate: "Dzisiaj",
    completed: false,
  },
  {
    id: 3,
    title: "Wymienić filtr w piecu",
    dueDate: "Jutro",
    completed: false,
  },
  {
    id: 4,
    title: "Zamówić pellet",
    dueDate: "Piątek",
    completed: false,
  },
  {
    id: 5,
    title: "Odebrać paczkę",
    dueDate: "Sobota",
    completed: true,
  },
];

export const shoppingItems = [
  {
    id: 1,
    name: "Mleko",
    quantity: "2 szt.",
    purchased: false,
  },
  {
    id: 2,
    name: "Chleb",
    quantity: "1 szt.",
    purchased: false,
  },
  {
    id: 3,
    name: "Jajka",
    quantity: "10 szt.",
    purchased: false,
  },
  {
    id: 4,
    name: "Pomidory",
    quantity: "1 kg",
    purchased: false,
  },
  {
    id: 5,
    name: "Ser żółty",
    quantity: "300 g",
    purchased: false,
  },
  {
    id: 6,
    name: "Masło",
    quantity: "1 szt.",
    purchased: true,
  },
];

export const healthEvents = [
  {
    id: 1,
    title: "Dentysta",
    person: "Jarek",
    date: "Dzisiaj",
    time: "15:30",
  },
  {
    id: 2,
    title: "Kontrola stomatologiczna",
    person: "Ola",
    date: "28 lipca",
    time: "10:00",
  },
  {
    id: 3,
    title: "Badania krwi",
    person: "Anna",
    date: "2 sierpnia",
    time: "08:00",
  },
  {
    id: 4,
    title: "Okulista",
    person: "Ola",
    date: "14 sierpnia",
    time: "12:30",
  },
];

export const energyData = {
  production: 18.4,
  consumption: 11.2,
  change: 14,

  history: [
    {
      day: "Pn",
      value: 12.4,
    },
    {
      day: "Wt",
      value: 16.8,
    },
    {
      day: "Śr",
      value: 10.2,
    },
    {
      day: "Czw",
      value: 19.5,
    },
    {
      day: "Pt",
      value: 21.3,
    },
    {
      day: "Sob",
      value: 17.6,
    },
    {
      day: "Nd",
      value: 18.4,
    },
  ],
};

export default function DashboardPage() {
  return (
    <div>
      <DashboardHero data={welcomeData} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Wydarzenia dzisiaj"
          value={4}
          description="wydarzenia"
          href="/calendar"
          icon={MdOutlineCalendarMonth}
        />

        <DashboardStatCard
          title="Zadania"
          value={8}
          description="na dzisiaj"
          href="/tasks"
          icon={MdOutlineChecklist}
          progress={75}
          progressLabel="6 z 8 wykonanych"
        />

        <DashboardStatCard
          title="Zakupy"
          value={12}
          description="produktów"
          href="/shopping"
          icon={MdOutlineShoppingCart}
        />

        <DashboardStatCard
          title="Energia dzisiaj"
          value="18.4"
          description="kWh"
          href="/energy"
          icon={MdOutlineSolarPower}
          trend={{
            value: "+14%",
            label: "vs wczoraj",
            positive: true,
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 my-4">
        <CalendarWidget events={calendarEvents} />
        <EnergyWidget
          production={energyData.production}
          consumption={energyData.consumption}
          change={energyData.change}
          history={energyData.history}
        />
      </div>
      {/* <div className="grid grid-cols-3 gap-4 my-4">
        <TasksWidget tasks={tasks} />
        <ShoppingWidget items={shoppingItems} />
        <HealthWidget events={healthEvents} />
      </div> */}
    </div>
  );
}
