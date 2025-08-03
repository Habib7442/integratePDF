import React from 'react';
import { Integration } from '@/stores/types';
import NotionIcon from '@/components/icons/NotionIcon';
import AirtableIcon from '@/components/icons/AirtableIcon';
import QuickbooksIcon from '@/components/icons/QuickbooksIcon';
import GoogleSheetsIcon from '@/components/icons/GoogleSheetsIcon';

export const INTEGRATIONS: Integration[] = [
  {
    id: 'notion',
    name: 'Notion',
    type: 'notion',
    icon: () => <NotionIcon className="w-6 h-6" />,
    description: 'Create database entries automatically',
    isAvailable: true,
    requiresAuth: true,
    authUrl: '/api/integrations/notion/auth',
    configFields: [
      {
        key: 'api_key',
        label: 'Internal Integration Secret',
        type: 'token',
        required: true,
        placeholder: 'Enter your Notion internal integration secret',
        description: 'Your Notion internal integration secret token'
      },
      {
        key: 'database_id',
        label: 'Database ID',
        type: 'text',
        required: true,
        placeholder: 'Enter your Notion database ID',
        description: 'The ID of the Notion database where data will be pushed'
      }
    ]
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    type: 'google_sheets',
    icon: () => <GoogleSheetsIcon className="w-6 h-6" />,
    description: 'Export data to Google Sheets automatically. Connect multiple times for different spreadsheets.',
    isAvailable: true,
    requiresAuth: true,
    authUrl: '/api/integrations/google-sheets/auth',
    configFields: [
      {
        key: 'spreadsheet_id',
        label: 'Spreadsheet ID',
        type: 'text',
        required: false,
        placeholder: 'Leave empty to create new spreadsheet',
        description: 'The ID of the Google Sheets spreadsheet (optional)'
      },
      {
        key: 'sheet_name',
        label: 'Sheet Name',
        type: 'text',
        required: false,
        placeholder: 'Sheet1',
        description: 'The name of the sheet within the spreadsheet'
      }
    ]
  },
  {
    id: 'airtable',
    name: 'Airtable',
    type: 'airtable',
    icon: () => <AirtableIcon className="w-6 h-6" />,
    description: 'Populate bases with structured data',
    isAvailable: false,
    requiresAuth: true,
    authUrl: '/api/integrations/airtable/auth',
    configFields: [
      {
        key: 'base_id',
        label: 'Base ID',
        type: 'text',
        required: true,
        placeholder: 'Enter your Airtable base ID',
        description: 'The ID of the Airtable base'
      },
      {
        key: 'table_name',
        label: 'Table Name',
        type: 'text',
        required: true,
        placeholder: 'Enter table name',
        description: 'The name of the table within the base'
      }
    ]
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    type: 'quickbooks',
    icon: () => <QuickbooksIcon className="w-6 h-6" />,
    description: 'Import financial data seamlessly',
    isAvailable: false,
    requiresAuth: true,
    authUrl: '/api/integrations/quickbooks/auth',
    configFields: [
      {
        key: 'company_id',
        label: 'Company ID',
        type: 'text',
        required: true,
        placeholder: 'Enter your QuickBooks company ID',
        description: 'Your QuickBooks company identifier'
      }
    ]
  }
];

export const getIntegrationById = (id: string): Integration | undefined => {
  return INTEGRATIONS.find(integration => integration.id === id);
};

export const getAvailableIntegrations = (): Integration[] => {
  return INTEGRATIONS.filter(integration => integration.isAvailable);
};

export const getIntegrationsByType = (type: 'notion' | 'airtable' | 'quickbooks' | 'google_sheets'): Integration[] => {
  return INTEGRATIONS.filter(integration => integration.type === type);
};
