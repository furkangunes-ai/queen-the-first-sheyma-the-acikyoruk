-- Phase 1: Quantum Void Model Reform (Part 1)
-- VoidStatus: RAW ekleme + schema değişiklikleri (RAW kullanmadan)

-- 1. VoidStatus enum'a RAW ekle
ALTER TYPE "VoidStatus" ADD VALUE IF NOT EXISTS 'RAW' BEFORE 'UNRESOLVED';
