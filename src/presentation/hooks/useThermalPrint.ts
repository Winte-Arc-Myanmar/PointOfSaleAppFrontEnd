"use client";

import { useCallback, useState } from "react";
import container from "@/core/infrastructure/di/container";
import type {
  IThermalPrintService,
  ReportPrintContext,
} from "@/core/domain/services/IThermalPrintService";
import type { Receipt } from "@/core/domain/entities/Receipt";
import type {
  DailySalesSummary,
  ZReport,
} from "@/core/domain/entities/Report";
import type {
  OrderSlip,
  ThermalPrintOptions,
  ThermalPrintResult,
} from "@/core/domain/entities/ThermalPrint";

function getThermalPrintService(): IThermalPrintService {
  return container.resolve<IThermalPrintService>("thermalPrintService");
}

export function useThermalPrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printReceipt = useCallback(
    async (
      receipt: Receipt,
      options?: ThermalPrintOptions,
    ): Promise<ThermalPrintResult> => {
      setIsPrinting(true);
      try {
        return await getThermalPrintService().printReceipt(receipt, options);
      } finally {
        setIsPrinting(false);
      }
    },
    [],
  );

  const printOrderSlip = useCallback(
    async (
      slip: OrderSlip,
      options?: ThermalPrintOptions,
    ): Promise<ThermalPrintResult> => {
      setIsPrinting(true);
      try {
        return await getThermalPrintService().printOrderSlip(slip, options);
      } finally {
        setIsPrinting(false);
      }
    },
    [],
  );

  const printZReport = useCallback(
    async (
      report: ZReport,
      context?: ReportPrintContext,
      options?: ThermalPrintOptions,
    ): Promise<ThermalPrintResult> => {
      setIsPrinting(true);
      try {
        return await getThermalPrintService().printZReport(
          report,
          context,
          options,
        );
      } finally {
        setIsPrinting(false);
      }
    },
    [],
  );

  const printDailySales = useCallback(
    async (
      summary: DailySalesSummary,
      context?: ReportPrintContext,
      options?: ThermalPrintOptions,
    ): Promise<ThermalPrintResult> => {
      setIsPrinting(true);
      try {
        return await getThermalPrintService().printDailySales(
          summary,
          context,
          options,
        );
      } finally {
        setIsPrinting(false);
      }
    },
    [],
  );

  return {
    isPrinting,
    printReceipt,
    printOrderSlip,
    printZReport,
    printDailySales,
  };
}
