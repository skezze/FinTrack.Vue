<template>
  <div class="fop-tax-calendar">
    <div class="controls">
      <label for="year-select">Рік:</label>
      <select id="year-select" v-model="selectedYear" class="year-select">
        <option v-for="year in availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>

    <div class="calendar-grid">
      <div v-for="q in 4" :key="`q-${q}`" class="quarter-column">
        <h3 class="quarter-title">{{ getQuarterName(q) }}</h3>

        <div class="months-container">
          <div
            v-for="month in getMonthsForQuarter(q)"
            :key="`m-${month}`"
            :class="['month-block', { 'current-month': isCurrentMonth(selectedYear, month) }]"
          >
            <div class="month-name">{{ getMonthName(month) }}</div>
            <div class="events-area">
              <div
                v-for="event in getEventsForMonth(q, month)"
                :key="event.id"
                :class="['event-item', `event-type-${event.type}`]"
                :title="`${event.title} (${event.details.description.match(/за\s+.*?\s+квартал\s+\d{4}/)?.[0] || ''}) - ${event.details.deadline}`"
                @click="showDetails(event)"
              >
                <span class="event-title">{{ event.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="legend">
      <h4>Легенда:</h4>
      <div class="legend-item"><span class="color-box event-type-declaration"></span> Декларація ЄП</div>
      <div class="legend-item"><span class="color-box event-type-payment_ep"></span> Сплата ЄП</div>
      <div class="legend-item"><span class="color-box event-type-payment_esv"></span> Сплата ЄСВ</div>
    </div>

    <div v-if="selectedEventDetails" class="event-details-area">
       <button @click="selectedEventDetails = null" class="close-details-btn" title="Закрити">×</button>
       <h3>Деталі: {{ selectedEventDetails.title }} ({{ selectedEventDetails.details.description.match(/за\s+.*?\s+квартал\s+\d{4}/)?.[0] || '' }})</h3>
      <p><strong>Що це:</strong> {{ selectedEventDetails.details.description }}</p>
      <p><strong>Граничний термін:</strong> {{ selectedEventDetails.details.deadline }}</p>
      <p v-if="selectedEventDetails.details.notes"><em>Примітка:</em> {{ selectedEventDetails.details.notes }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

const selectedYear = ref(currentYear);
const selectedEventDetails = ref(null);

function generateFopEvents(year) {
  const events = [];
  const quarters = [1, 2, 3, 4];

  const esvMonths = [4, 7, 10, 1];
  const declMonths = [5, 8, 11, 2];
  const epMonths = [5, 8, 11, 2];

  const esvDeadlineDay = 19;
  const declDeadlineDay = 10;
  const epDeadlineDay = 19;

  quarters.forEach(q => {
    const activityYear = year;
    const esvDeadlineYear = (q === 4 && esvMonths[q-1] === 1) ? year + 1 : year;
    const declDeadlineYear = (q === 4 && declMonths[q-1] === 2) ? year + 1 : year;
    const epDeadlineYear = (q === 4 && epMonths[q-1] === 2) ? year + 1 : year;

    events.push({
      id: `y${activityYear}_q${q}_esv`, type: 'payment_esv', title: 'Сплата ЄСВ',
      quarter: q,
      month: esvMonths[q-1],
      year: esvDeadlineYear,
      status: 'info',
      details: {
          deadline: `До ${esvDeadlineDay} ${getMonthNameGenitive(esvMonths[q-1])} ${esvDeadlineYear}р.`,
          description: `Єдиний Соціальний Внесок за ${getQuarterNameRoman(q)} квартал ${activityYear}р.`,
          notes: 'Сплачується щоквартально, не пізніше 19 числа місяця, наступного за кварталом.'
      }
    });

    events.push({
      id: `y${activityYear}_q${q}_declaration`, type: 'declaration', title: 'Декларація ЄП',
      quarter: q, month: declMonths[q-1], year: declDeadlineYear, status: 'info',
      details: {
          deadline: `До ${declDeadlineDay} ${getMonthNameGenitive(declMonths[q-1])} ${declDeadlineYear}р.`,
          description: `Податкова декларація платника єдиного податку за ${getQuarterNameRoman(q)} квартал ${activityYear}р.`,
          notes: 'Подається протягом 40 календарних днів після закінчення кварталу.'
      }
    });

    events.push({
      id: `y${activityYear}_q${q}_ep`, type: 'payment_ep', title: 'Сплата ЄП',
      quarter: q, month: epMonths[q-1], year: epDeadlineYear, status: 'info',
      details: {
          deadline: `До ${epDeadlineDay} ${getMonthNameGenitive(epMonths[q-1])} ${epDeadlineYear}р.`,
          description: `Єдиний Податок за ${getQuarterNameRoman(q)} квартал ${activityYear}р.`,
          notes: 'Сплачується протягом 10 календарних днів після граничного терміну подання квартальної декларації.'
      }
    });
  });

  const prevYear = year - 1;
  const prevQ = 4;
  const prevEsvMonth = esvMonths[prevQ-1];
  const prevDeclMonth = declMonths[prevQ-1];
  const prevEpMonth = epMonths[prevQ-1];

  events.push({
      id: `y${prevYear}_q${prevQ}_esv`, type: 'payment_esv', title: 'Сплата ЄСВ', quarter: prevQ, month: prevEsvMonth, year: year, status: 'info',
      details: { deadline: `До ${esvDeadlineDay} ${getMonthNameGenitive(prevEsvMonth)} ${year}р.`, description: `Єдиний Соціальний Внесок за ${getQuarterNameRoman(prevQ)} квартал ${prevYear}р.`, notes: 'Сплачується щоквартально.' }
  });
  events.push({
      id: `y${prevYear}_q${prevQ}_declaration`, type: 'declaration', title: 'Декларація ЄП', quarter: prevQ, month: prevDeclMonth, year: year, status: 'info',
      details: { deadline: `До ${declDeadlineDay} ${getMonthNameGenitive(prevDeclMonth)} ${year}р.`, description: `Податкова декларація платника єдиного податку за ${getQuarterNameRoman(prevQ)} квартал ${prevYear}р.`, notes: 'Подається протягом 40 к.д. після кварталу.' }
  });
  events.push({
      id: `y${prevYear}_q${prevQ}_ep`, type: 'payment_ep', title: 'Сплата ЄП', quarter: prevQ, month: prevEpMonth, year: year, status: 'info',
      details: { deadline: `До ${epDeadlineDay} ${getMonthNameGenitive(prevEpMonth)} ${year}р.`, description: `Єдиний Податок за ${getQuarterNameRoman(prevQ)} квартал ${prevYear}р.`, notes: 'Сплачується протягом 10 к.д. після терміну подання декларації.' }
  });


  return events;
}

const fopEvents = computed(() => generateFopEvents(selectedYear.value));

const availableYears = computed(() => {
  const baseYear = new Date().getFullYear();
  return [baseYear - 1, baseYear, baseYear + 1];
});

function getQuarterName(q) { const names = ['І квартал', 'ІІ квартал', 'III квартал', 'IV квартал']; return names[q - 1]; }
function getQuarterNameRoman(q) { const names = ['I', 'II', 'III', 'IV']; return names[q - 1]; }
function getMonthsForQuarter(q) { const months = [ [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12] ]; return months[q - 1]; }
function getMonthName(m) { const names = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']; return names[m - 1]; }
function getMonthNameGenitive(m) { const names = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня']; return names[m - 1]; }

function getEventsForMonth(quarter, month) {
    return fopEvents.value.filter(event => event.month === month && event.year === selectedYear.value);
}

function showDetails(event) { selectedEventDetails.value = event; }
function isCurrentMonth(year, month) { return year === currentYear && month === currentMonth; }

watch(selectedYear, () => { selectedEventDetails.value = null; });

</script>

<style scoped>

.fop-tax-calendar { font-family: sans-serif; background-color: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); position: relative; }
.controls { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
.controls label { font-weight: 500; }
.year-select { padding: 0.5rem 0.8rem; border: 1px solid #ccc; border-radius: 4px; background-color: #fff; cursor: pointer; }
.calendar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }

.quarter-column { border: 1px solid #e0e0e0; border-radius: 6px; background-color: #fdfdfd; display: flex; flex-direction: column; }
.quarter-title { text-align: center; font-size: 0.9rem; font-weight: 600; padding: 0.6rem 0.5rem; margin: 0; background-color: #f5f5f5; border-bottom: 1px solid #e0e0e0; border-radius: 6px 6px 0 0; flex-shrink: 0; }

.months-container { padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1; }
.month-block { padding: 0.5rem; border: 1px solid #eee; background-color: #fff; border-radius: 4px; min-height: 70px; display: flex; flex-direction: column; transition: background-color 0.2s ease; }
.month-block.current-month { background-color: #fff9e6; border-color: #ffecb3; }
.month-name { font-size: 0.75rem; font-weight: bold; color: #555; margin-bottom: 0.4rem; text-align: center; flex-shrink: 0; }
.events-area { display: flex; flex-direction: column; gap: 4px; flex-grow: 1; }

.event-item { font-size: 0.7rem; padding: 4px 6px; border-radius: 3px; color: #fff; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; cursor: pointer; transition: filter 0.2s ease, transform 0.1s ease; position: relative; }
.event-item:hover { filter: brightness(1.1); transform: translateX(2px); }

.event-type-declaration { background-color: #3498db; }
.event-type-payment_ep { background-color: #e67e22; }
.event-type-payment_esv { background-color: #2ecc71; }

.legend { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.85rem; color: #333; }
.legend h4 { margin-top: 0; margin-bottom: 0.5rem; font-size: 0.9rem; }
.legend-item { display: flex; align-items: center; margin-bottom: 4px; }
.color-box { display: inline-block; width: 12px; height: 12px; margin-right: 8px; border-radius: 2px; border: 1px solid rgba(0,0,0,0.1); }

.event-details-area { margin-top: 1.5rem; padding: 1.5rem; border: 1px solid #d1e7dd; background-color: #f8fcfb; border-radius: 8px; position: relative; }
.event-details-area h3 { margin-top: 0; margin-bottom: 1rem; font-size: 1.2rem; color: #0a3622; }
.event-details-area p { margin-bottom: 0.6rem; line-height: 1.5; color: #333; }
.event-details-area p strong { color: #198754; }
.event-details-area p em { color: #555; font-size: 0.9em; }
.close-details-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.8rem; line-height: 1; color: #aaa; cursor: pointer; padding: 0; }
.close-details-btn:hover { color: #777; }
</style>