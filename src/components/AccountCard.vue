<template>
  <div class="card clickable" @click="onItemClick">
    <div class="card-header">
      💳 {{ safeMaskedPan }}
    </div>
    <div class="card-body">
      <dl>
        <dt>IBAN:</dt>
        <dd>{{ account.iban || 'N/A' }}</dd>

        <dt>Тип картки:</dt>
        <dd>{{ account.type || 'N/A' }}</dd>

        <dt>Баланс:</dt>
        <dd>{{ formatCurrency(account.balance, account.currencyCode) }}</dd>

        <dt>Кредитний ліміт:</dt>
        <dd>{{ formatCurrency(account.creditLimit, account.currencyCode) }}</dd>

        <dt>Валюта:</dt>
         <dd>{{ currencyCodeToName(account.currencyCode) }}</dd>

        <dt>Тип кешбеку:</dt>
        <dd>{{ account.cashbackType || 'N/A' }}</dd>
      </dl>
    </div>
  </div>
</template>

<script>
// Импортируем defineComponent и функции Composition API
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AccountCard', // Имя компонента (хорошая практика)

  // Определяем пропсы через опцию 'props'
  props: {
    account: {
      type: Object,
      required: true,
      validator: (value) => {
        const hasRequired = typeof value.id !== 'undefined' &&
               typeof value.balance === 'number' &&
               typeof value.creditLimit === 'number' &&
               typeof value.currencyCode === 'number' &&
               typeof value.iban === 'string';
        if (!hasRequired) {
             console.warn("AccountCard prop missing required fields", value);
        }
        return hasRequired;
      }
    }
  },

  // Определяем события через опцию 'emits'
  emits: ['view-details'],

  // Функция setup получает props и context (включая emit)
  setup(props, { emit }) {

    // --- Вспомогательные функции ---
    function getCurrencyString(code) {
      const map = { 980: 'UAH', 840: 'USD', 978: 'EUR' };
      return map[code] || '';
    }

    // --- Computed свойства ---
    // Используем props.account для доступа к данным внутри setup
    const safeMaskedPan = computed(() => {
      return props.account?.maskedPan?.[0] ?? '**** **** **** ****';
    });

    // --- Методы (обычные функции внутри setup) ---
    function formatCurrency(value, currencyCode) {
      const amount = (value ?? 0) / 100;
      const currencyString = getCurrencyString(currencyCode);
      if (!currencyString) {
           console.warn(`Unknown currency code: ${currencyCode}. Formatting as number.`);
           return amount.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      try {
          return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: currencyString }).format(amount);
      } catch (e) {
          console.error("Error formatting currency:", e);
          return amount.toFixed(2) + ' ' + currencyString;
      }
    }

    function currencyCodeToName(code) {
        const name = getCurrencyString(code);
        return name || `Код ${code}`;
    }

    function onItemClick() {
        console.log("Item clicked (setup function), emitting view-details with ID:", props.account.id);
        // Используем emit из второго аргумента setup
        emit('view-details', props.account.id);
    }

    // --- Возвращаем все, что должно быть доступно в шаблоне ---
    return {
      safeMaskedPan,    // computed свойство
      formatCurrency,   // метод
      currencyCodeToName,// метод
      onItemClick       // метод для @click
      // props.account будет доступен в шаблоне автоматически через определение props
    };
  }
});
</script>

<style scoped>
/* Стили остаются точно такими же, как в предыдущей версии */
.card {
  border: 1px solid #e0e0e0;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
  background-color: #fff;
  transition: box-shadow 0.2s ease-in-out;
  box-sizing: border-box;
}
.card.clickable { cursor: pointer; }
.card.clickable:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.card-header {
  font-weight: bold; font-size: 1.25rem; margin-bottom: 1rem; color: #333;
  border-bottom: 1px solid #f0f0f0; padding-bottom: 0.75rem; word-break: break-all;
}
.card-body dl { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 0.5rem 1rem; }
.card-body dt { font-weight: 600; color: #555; grid-column: 1; }
.card-body dd { margin: 0; color: #333; grid-column: 2; word-break: break-all; text-align: right; }
</style>