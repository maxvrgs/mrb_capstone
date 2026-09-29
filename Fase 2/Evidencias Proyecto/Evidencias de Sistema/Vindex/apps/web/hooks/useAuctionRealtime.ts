"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  formatAuctionBid,
  parseFiniteNumber,
  type AuctionBid,
  type AuctionProduct,
} from "@/lib/product-utils";

type AuctionRealtimeState = {
  product: AuctionProduct;
  bids: AuctionBid[];
  isConnected: boolean;
  realtimeError: string | null;
};

export function useAuctionRealtime(
  productId: number,
  initialProduct: AuctionProduct,
  initialBids: AuctionBid[],
) {
  const [supabase] = useState(createClient);
  const [product, setProduct] = useState(initialProduct);
  const [bids, setBids] = useState(initialBids);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);

  useEffect(() => {
    setProduct(initialProduct);
    setBids(initialBids);
  }, [productId, initialProduct, initialBids]);

  useEffect(() => {
    setIsConnected(false);
    setRealtimeError(null);
    const numericProductId = Number(productId);
    if (!Number.isSafeInteger(numericProductId) || numericProductId <= 0) {
      const message = `ID de subasta inválido: ${String(productId)}`;
      console.error("[Realtime error]:", message);
      setRealtimeError("No se pudo iniciar la conexión de la subasta.");
      return;
    }

    const updateCurrentBid = (amount: number) => {
      setProduct((currentProduct) => ({
        ...currentProduct,
        current_bid: Math.max(
          currentProduct.current_bid ?? currentProduct.starting_price ?? 0,
          amount,
        ),
      }));
    };

    const addBidIfMissing = (bid: AuctionBid) => {
      setBids((previousBids) => {
        if (previousBids.some((existingBid) => String(existingBid.id) === String(bid.id))) {
          return previousBids;
        }
        return [bid, ...previousBids].slice(0, 20);
      });
      updateCurrentBid(bid.amount);
      setRealtimeError(null);
    };

    const getProfileName = (profile: unknown): string | null => {
      const row = Array.isArray(profile) ? profile[0] : profile;
      if (typeof row !== "object" || row === null || !("full_name" in row)) return null;
      return typeof row.full_name === "string" ? row.full_name : null;
    };

    const fetchLatestBid = async () => {
      const { data: latestBids, error } = await supabase
        .from("bids")
        .select(`
          id,
          product_id,
          bidder_id,
          amount,
          created_at,
          profiles:profiles!fk_bids_profiles (
            full_name
          )
        `)
        .eq("product_id", numericProductId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("[Realtime] No se pudo recuperar la última puja:", error.message);
        return;
      }

      const latestRow = latestBids?.[0];
      if (!latestRow) {
        console.warn(`[Realtime] Todavía no hay una puja recuperable para la subasta ${numericProductId}.`);
        return;
      }

      const bid = formatAuctionBid(latestRow);
      if (!bid || bid.product_id !== numericProductId) {
        console.error("[Realtime] La consulta de respaldo devolvió una puja inválida:", latestRow);
        return;
      }

      addBidIfMissing(bid);
    };

    const channel = supabase
      .channel(`auction-room-${numericProductId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `product_id=eq.${Number(productId)}`,
        },
        async (payload) => {
          console.log("[DEBUG Raw Realtime Payload]:", payload);
          console.log("[Realtime Evento Capturado]:", payload);
          const rawBid = payload.new;
          if (!rawBid || Object.keys(rawBid).length === 0) {
            console.warn("[Realtime] El payload llegó vacío; consultando la última puja.");
            await fetchLatestBid();
            return;
          }

          const newBid = formatAuctionBid(payload.new);
          if (!newBid || newBid.product_id !== numericProductId) {
            console.warn("[Realtime] El payload no está completo; consultando la última puja.", payload.new);
            await fetchLatestBid();
            return;
          }

          let profileName = newBid.bidder_name;
          try {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", newBid.bidder_id)
              .single();
            if (error) throw error;
            profileName = getProfileName(profile) ?? "Postor Anónimo";
          } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error(
              `[Realtime] No se pudo cargar el perfil del postor ${newBid.bidder_id}:`,
              message,
            );
          }

          const fullBid: AuctionBid = {
            ...newBid,
            bidder_name: profileName,
          };
          addBidIfMissing(fullBid);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `id=eq.${Number(productId)}`,
        },
        (payload) => {
          console.log("[Realtime Product Update Received]:", payload);
          const updatedProduct = payload.new as Record<string, unknown>;
          const currentBid =
            updatedProduct.current_bid === null
              ? null
              : parseFiniteNumber(updatedProduct.current_bid);
          setProduct((currentProduct) => ({
            ...currentProduct,
            ...(currentBid !== null || updatedProduct.current_bid === null
              ? { current_bid: currentBid }
              : {}),
            ...(typeof updatedProduct.auction_ends_at === "string" || updatedProduct.auction_ends_at === null
              ? { auction_ends_at: updatedProduct.auction_ends_at }
              : {}),
            ...(typeof updatedProduct.winner_id === "string" || updatedProduct.winner_id === null
              ? { winner_id: updatedProduct.winner_id }
              : {}),
          }));
        },
      )
      .subscribe((status, error) => {
        console.log(`[Realtime status]: ${status}`);
        if (error) console.error("[Realtime error]:", error);

        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setRealtimeError(null);
          return;
        }

        setIsConnected(false);
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          const message = error?.message ?? `Estado del canal: ${status}`;
          console.error(`No se pudo sincronizar la subasta ${numericProductId}:`, message);
          setRealtimeError("La conexión en vivo no está disponible. Actualiza la página para sincronizar.");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [productId, supabase]);

  return { product, bids, isConnected, realtimeError } satisfies AuctionRealtimeState;
}
