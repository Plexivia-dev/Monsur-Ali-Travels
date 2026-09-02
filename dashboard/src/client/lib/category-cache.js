import React, { useState, useEffect } from 'react';
import { apiClient } from './api-client';

let categoryCache = [];
let brandCache = [];

export function getCategoryName(id) {
  if (!id) return '';
  const item = categoryCache.find((c) => c.id === id || c._id === id || c.did === id || c.name === id);
  return item ? item.name : id;
}

export function getBrandName(id) {
  if (!id) return '';
  const item = brandCache.find((b) => b.id === id || b._id === id || b.did === id || b.name === id);
  return item ? item.name : id;
}

export function useCategories() {
  const [categories, setCategories] = useState(categoryCache);
  useEffect(() => {
    if (categoryCache.length > 0) return;
    apiClient.get('/api/v1/client/categories').then((res) => {
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      categoryCache = list;
      setCategories(list);
    }).catch(() => {});
  }, []);
  return categories;
}

export function useBrands() {
  const [brands, setBrands] = useState(brandCache);
  useEffect(() => {
    if (brandCache.length > 0) return;
    apiClient.get('/api/v1/client/brands').then((res) => {
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      brandCache = list;
      setBrands(list);
    }).catch(() => {});
  }, []);
  return brands;
}

export function MetadataCacheLoader() {
  useEffect(() => {
    if (categoryCache.length === 0) {
      apiClient.get('/api/v1/client/categories').then((res) => {
        categoryCache = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      }).catch(() => {});
    }
    if (brandCache.length === 0) {
      apiClient.get('/api/v1/client/brands').then((res) => {
        brandCache = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      }).catch(() => {});
    }
  }, []);
  return null;
}

export default {
  getCategoryName,
  getBrandName,
  useCategories,
  useBrands,
  MetadataCacheLoader,
};
