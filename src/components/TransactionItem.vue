<template>
  <div class="transaction-item clickable" @click="onItemClick">
    <div class="top-line">
      <div class="description">{{ transaction.description }}</div>
      <div class="amount" :class="{ negative: transaction.amount < 0, positive: transaction.amount > 0 }">
        {{ formatAmountWithCurrency(transaction.amount) }}
      </div>
    </div>
    <div class="details">
      <span class="date">{{ formattedDateTime }}</span>
      <span v-if="transaction.comment">· {{ transaction.comment }}</span>
      <span v-if="transaction.cashbackAmount" class="cashback">
         · Кешбек: {{ formatAmountWithCurrency(transaction.cashbackAmount) }}
       </span>
    </div>
    <div class="meta" v-if="formattedMeta">
       {{ formattedMeta }}
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

// Определяем пропсы с валидатором
const props = defineProps({
  transaction: {
      type: Object,
      required: true,
      validator: (value) => {
          // Базовая проверка наличия ключевых полей
          const hasRequired = typeof value.id !== 'undefined' &&
                 typeof value.time === 'number' &&
                 typeof value.description === 'string' &&
                 typeof value.amount === 'number';
          if (!hasRequired) {
              console.warn("Transaction prop missing required fields (id, time, description, amount)", value);
          }
          return hasRequired;
      }
  }
})

// Определяем событие, которое компонент может генерировать
const emit = defineEmits(['view-details']);

// Функция для обработки клика по карточке
function onItemClick() {
    console.log("Item clicked, emitting view-details with ID:", props.transaction.id);
    emit('view-details', props.transaction.id); // Отправляем событие с ID транзакции
}


// Форматирование даты и времени
const formattedDateTime = computed(() => {
  try {
      const date = new Date(props.transaction.time * 1000);
      if (isNaN(date.getTime())) { // Проверка на валидность даты
           throw new Error("Invalid date object");
      }
      // 'uk-UA' - локаль для Украины
      return date.toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit' // Можно добавить секунды, если нужно
      });
  } catch (e) {
      console.error("Error formatting date for transaction:", props.transaction.id, e);
      return "Неверная дата"; // Возвращаем запасное значение
  }
});

// Форматирование суммы (и кешбэка) с указанием валюты
function formatAmountWithCurrency(amountInKopiykas) {
  // Проверяем, что это число, иначе возвращаем пустую строку или 0
  if (typeof amountInKopiykas !== 'number' || isNaN(amountInKopiykas)) {
       console.warn("Invalid amount passed to formatAmountWithCurrency:", amountInKopiykas);
       return '0,00 ₴'; // Или пустую строку ''
  }
  const amount = amountInKopiykas / 100;
  try {
      return amount.toLocaleString('uk-UA', {
        style: 'currency',
        currency: 'UAH', // Код валюты для гривны
        // minimumFractionDigits: 2, // По умолчанию 2 для currency
        // maximumFractionDigits: 2
      });
  } catch (e) {
      console.error("Error formatting currency:", e);
      // Возвращаем базовое форматирование в случае ошибки
      return (amountInKopiykas / 100).toFixed(2) + ' ₴';
  }
}

// Форматирование мета-данных (контрагент + IBAN)
const formattedMeta = computed(() => {
    const parts = [];
    if (props.transaction.counterName) {
        parts.push(props.transaction.counterName.trim());
    }
    if (props.transaction.counterIban) {
         // Тут можно добавить маскирование IBAN при необходимости
        parts.push(props.transaction.counterIban.trim());
    }
    // Соединяем только непустые части
    return parts.filter(part => part).join(' | ');
});

</script>

<style scoped>
.transaction-item {
  background-color: #fff;
  border: 1px solid #e4e4e4; /* Сделал рамку чуть нейтральнее */
  border-radius: 10px; /* Немного уменьшил радиус */
  padding: 14px 18px;
  margin-bottom: 12px; /* Уменьшил нижний отступ */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); /* Слегка изменил тень */
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease; /* Добавил transition */
}

/* Стиль для кликабельных элементов */
.transaction-item.clickable {
  cursor: pointer;
}

.transaction-item.clickable:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.07); /* Усиленная тень при наведении */
  border-color: #dcdcdc; /* Слегка изменяем цвет рамки */
  /* transform: translateY(-1px); */ /* Легкий сдвиг вверх */
}

.top-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Выравнивание по верху для длинных описаний */
  margin-bottom: 6px;
  gap: 10px; /* Добавил промежуток между описанием и суммой */
}

.description {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
  word-break: break-word; /* Перенос длинных слов в описании */
}

.amount {
  font-weight: 600; /* Сделал чуть менее жирным */
  font-size: 1rem;
  white-space: nowrap; /* Предотвращаем перенос суммы */
  text-align: right;
}

.amount.negative {
  color: #d9534f; /* Немного изменил красный */
}

.amount.positive {
  color: #5cb85c; /* Немного изменил зеленый */
}

.details {
  font-size: 0.85rem; /* Немного уменьшил */
  color: #555; /* Сделал чуть темнее */
  margin-bottom: 8px; /* Увеличил отступ */
  line-height: 1.4; /* Улучшил читаемость */
}

.details > span:not(:first-child) {
    margin-left: 3px; /* Небольшой отступ для разделителя */
}

.cashback {
  color: #e18877; /* Можно использовать цвет позитивных транзакций */
  /* color: #5cb85c; */
  font-weight: 500;
  /* font-style: italic; */ /* Можно сделать курсивом */
}

.meta {
  font-size: 0.78rem; /* Немного увеличил */
  color: #888; /* Сделал чуть темнее */
  word-break: break-all; /* Разрешаем перенос IBAN */
  line-height: 1.3;
}
</style>