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

const props = defineProps({
  transaction: {
      type: Object,
      required: true,
      validator: (value) => {
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

const emit = defineEmits(['view-details']);

function onItemClick() {
    console.log("Item clicked, emitting view-details with ID:", props.transaction.id);
    emit('view-details', props.transaction.id);
}

const formattedDateTime = computed(() => {
  try {
      const date = new Date(props.transaction.time * 1000);
      if (isNaN(date.getTime())) {
           throw new Error("Invalid date object");
      }
      return date.toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
  } catch (e) {
      console.error("Error formatting date for transaction:", props.transaction.id, e);
      return "Неверная дата";
  }
});

function formatAmountWithCurrency(amountInKopiykas) {
  if (typeof amountInKopiykas !== 'number' || isNaN(amountInKopiykas)) {
       console.warn("Invalid amount passed to formatAmountWithCurrency:", amountInKopiykas);
       return '0,00 ₴';
  }
  const amount = amountInKopiykas / 100;
  try {
      return amount.toLocaleString('uk-UA', {
        style: 'currency',
        currency: 'UAH',
      });
  } catch (e) {
      console.error("Error formatting currency:", e);
      return (amountInKopiykas / 100).toFixed(2) + ' ₴';
  }
}

const formattedMeta = computed(() => {
    const parts = [];
    if (props.transaction.counterName) {
        parts.push(props.transaction.counterName.trim());
    }
    if (props.transaction.counterIban) {
        parts.push(props.transaction.counterIban.trim());
    }
    return parts.filter(part => part).join(' | ');
});

</script>

<style scoped>
.transaction-item {
  background-color: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.transaction-item.clickable {
  cursor: pointer;
}

.transaction-item.clickable:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.07);
  border-color: #dcdcdc;
}

.top-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 10px;
}

.description {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
  word-break: break-word;
}

.amount {
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  text-align: right;
}

.amount.negative {
  color: #d9534f;
}

.amount.positive {
  color: #5cb85c;
}

.details {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 8px;
  line-height: 1.4;
}

.details > span:not(:first-child) {
    margin-left: 3px;
}

.cashback {
  color: #e18877;
  font-weight: 500;
}

.meta {
  font-size: 0.78rem;
  color: #888;
  word-break: break-all;
  line-height: 1.3;
}
</style>