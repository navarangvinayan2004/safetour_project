import { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

export default function SearchScreen() {

  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  //------------------------------------------------
  // SEARCH (OpenStreetMap Nominatim)
  //------------------------------------------------

  const searchPlaces = async (text: string) => {

    setQuery(text);

    if (text.length < 3) {
      setResults([]);
      return;
    }

    try {

      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: text,
            format: "json",
            limit: 5,
          },
          headers: {
            "User-Agent": "SafeTourApp",
          },
        }
      );

      setResults(res.data);

    } catch (err) {

      console.log("Search error", err);

    }

  };

  //------------------------------------------------
  // SELECT LOCATION
  //------------------------------------------------

  const selectPlace = async (place: any) => {

    await AsyncStorage.setItem(
      "destination",
      JSON.stringify({
        lat: place.lat,
        lng: place.lon,
        name: place.display_name,
      })
    );

    router.replace({
      pathname: "/(tabs)/maps",
      params: {
        lat: place.lat,
        lng: place.lon,
      },
    });

  };

  //------------------------------------------------
  // UI
  //------------------------------------------------

  return (

    <View style={styles.container}>

      {/* Search Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Search destination..."
          placeholderTextColor={COLORS.placeholderText}
          value={query}
          onChangeText={searchPlaces}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (

          <TouchableOpacity
            style={[
              styles.item,
              index === results.length - 1 && styles.itemLast,
            ]}
            onPress={() => selectPlace(item)}
            activeOpacity={0.7}
          >

            {/* Pin Icon Badge */}
            <View style={styles.itemIconContainer}>
              <Text style={styles.itemIcon}>📍</Text>
            </View>

            {/* Place Name */}
            <Text style={styles.place} numberOfLines={2}>
              {item.display_name}
            </Text>

          </TouchableOpacity>

        )}
        ListEmptyComponent={
          query.length >= 3 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptyHint}>Try a different search term</Text>
            </View>
          ) : null
        }
      />

    </View>

  );

}

// ─────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────

const COLORS = {
  screenBackground:   "#F7F8FA",
  inputBackground:    "#FFFFFF",
  itemBackground:     "#FFFFFF",
  inputBorder:        "#DDE1EA",
  itemDivider:        "#ECEEF2",
  focusBorder:        "#3B5BDB",
  primaryText:        "#1A1D23",
  secondaryText:      "#6B7280",
  placeholderText:    "#A3A9B7",
  accentLight:        "#EEF2FF",
  shadowColor:        "#000000",
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Layout ───────────────────────────────────

  container: {
    flex: 1,
    backgroundColor: COLORS.screenBackground,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── Input ─────────────────────────────────────

  inputWrapper: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: 16,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  input: {
    height: 50,
    fontSize: 16,
    fontWeight: "400",
    color: COLORS.primaryText,
  },

  // ── List ──────────────────────────────────────

  listContent: {
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // ── Item ──────────────────────────────────────

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.itemBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.itemDivider,
  },

  itemLast: {
    borderBottomWidth: 0,
  },

  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: COLORS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  itemIcon: {
    fontSize: 16,
  },

  // ── Text ──────────────────────────────────────

  place: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.primaryText,
    lineHeight: 22,
  },

  // ── Empty State ───────────────────────────────

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.secondaryText,
  },

  emptyHint: {
    fontSize: 13,
    color: COLORS.placeholderText,
    marginTop: 4,
  },

});
