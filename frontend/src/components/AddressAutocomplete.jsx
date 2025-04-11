import React, { useState, useEffect, useRef } from 'react';

const AddressAutocomplete = ({ onAddressSelect, initialValue = '' }) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Search for address suggestions
    const searchAddress = async (searchText) => {
        if (!searchText || searchText.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            // Direct call to Nominatim with proper headers
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5&addressdetails=1`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'YourApp/1.0',  // Required by Nominatim policy
                        'Referer': window.location.origin  // Adding referrer for tracking
                    },
                    mode: 'cors'  // Explicitly request CORS
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Format suggestions
            const formattedSuggestions = data.map(item => ({
                display: item.display_name,
                address: {
                    street: [item.address?.road, item.address?.house_number].filter(Boolean).join(' ') || '',
                    city: item.address?.city || item.address?.town || item.address?.village || '',
                    state: item.address?.state || '',
                    zipCode: item.address?.postcode || '',
                    country: item.address?.country || '',
                    coordinates: {
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon)
                    }
                }
            }));
            
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce search to avoid too many requests
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setShowSuggestions(true);
        
        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Set new timer
        debounceTimerRef.current = setTimeout(() => {
            searchAddress(value);
        }, 500);
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion) => {
        setQuery(suggestion.display);
        setShowSuggestions(false);
        onAddressSelect(suggestion.address);
    };

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                placeholder="Search address"
                className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            {isLoading && (
                <div className="absolute right-2 top-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                </div>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
                <div 
                    ref={suggestionsRef}
                    className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded mt-1 max-h-60 overflow-y-auto shadow-lg"
                    style={{ zIndex: 9999 }} /* Add explicit z-index */
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="p-2 hover:bg-gray-700 cursor-pointer text-white text-sm border-b border-gray-700 last:border-0"
                            onClick={() => handleSelectSuggestion(suggestion)}
                        >
                            {suggestion.display}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;