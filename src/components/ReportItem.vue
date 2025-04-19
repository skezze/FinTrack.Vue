<template>
    <div class="report-item" @click="emitView" title="Натисніть для перегляду">
      <div class="report-icon">
        <span v-if="report.isSigned">✍️</span>
        <span v-else>📄</span>
      </div>
      <div class="report-info">
        <div class="report-name">{{ report.name }}</div>
        <div class="report-meta">
          <span>Створено: {{ formatDate(report.createdAt) }}</span>
          <span v-if="report.accountIban">Рахунок: {{ formatIban(report.accountIban) }}</span>
        </div>
      </div>
      <div class="report-status">
        <span v-if="report.isSigned" class="signed">Підписано</span>
        <span v-else class="not-signed">Не підписано</span>
      </div>
      <a
          :href="report.pdfUrl"
          download
          @click.stop class="download-btn"
          title="Завантажити PDF"
          v-if="report.pdfUrl && report.pdfUrl !== '#'" >
          ⬇️
      </a>
      </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    report: {
      type: Object,
      required: true,
      validator: (value) => typeof value.id !== 'undefined' && typeof value.name === 'string'
    }
  });
  
  const emit = defineEmits(['view']);
  
  function emitView() {
    emit('view', props.report);
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) { return dateString; }
  }
  
  function formatIban(iban) {
      if (!iban) return 'N/A';
      return '...' + iban.slice(-4);
  }
  </script>
  
  <style scoped>
  .report-item {
    display: flex;
    align-items: center;
    padding: 0.8rem 1rem;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    margin-bottom: 0.8rem;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
    gap: 1rem;
  }
  
  .report-item:hover {
    background-color: #f9f9f9;
    box-shadow: 0 2px 5px rgba(0,0,0,0.06);
  }
  
  .report-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }
  
  .report-info {
    flex-grow: 1;
    min-width: 0;
  }
  
  .report-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .report-meta {
    font-size: 0.8rem;
    color: #666;
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
  }
  
  .report-status {
    flex-shrink: 0;
    margin-left: auto;
    padding-right: 1rem;
  }
  
  .report-status span {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
  }
  
  .report-status .signed { color: #146c43; background-color: #d1e7dd; }
  .report-status .not-signed { color: #b02a37; background-color: #f8d7da; }
  
  .download-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.2rem;
      text-decoration: none;
      color: #6c757d;
      padding: 5px 8px;
      border-radius: 5px;
      border: 1px solid transparent;
      line-height: 1;
      transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  .download-btn:hover {
      background-color: #e9ecef;
      border-color: #dee2e6;
      color: #495057;
  }
  
  </style>