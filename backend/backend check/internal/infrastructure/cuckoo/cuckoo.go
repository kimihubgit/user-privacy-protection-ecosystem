package cuckoo

import (
	"crypto/rand"
	"errors"
	"hash/fnv"
	"sync"
)

const (
	slotsPerBucket = 4
	maxKicks       = 500
)

type bucket [slotsPerBucket]byte

type Filter struct {
	mu       sync.RWMutex
	buckets  []bucket
	numItems int
	m        uint32 // Number of buckets (must be power of 2)
}

// NewFilter creates a new Cuckoo Filter with target capacity.
func NewFilter(capacity uint32) *Filter {
	numBuckets := capacity / slotsPerBucket
	if numBuckets == 0 {
		numBuckets = 1
	}
	// Round up to power of 2
	n := uint32(1)
	for n < numBuckets {
		n <<= 1
	}

	return &Filter{
		buckets: make([]bucket, n),
		m:       n,
	}
}

// fingerprint generates a 1-byte fingerprint. Must be non-zero.
func fingerprint(data []byte) byte {
	h := fnv.New32a()
	h.Write(data)
	f := byte(h.Sum32() & 0xFF)
	if f == 0 {
		return 1
	}
	return f
}

func (f *Filter) hashIndex(data []byte) uint32 {
	h := fnv.New32a()
	h.Write(data)
	return h.Sum32() & (f.m - 1)
}

func (f *Filter) secondaryIndex(i1 uint32, fp byte) uint32 {
	h := fnv.New32a()
	h.Write([]byte{fp})
	return (i1 ^ h.Sum32()) & (f.m - 1)
}

func (f *Filter) Add(data []byte) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	fp := fingerprint(data)
	i1 := f.hashIndex(data)
	i2 := f.secondaryIndex(i1, fp)

	// Try bucket i1
	for k := 0; k < slotsPerBucket; k++ {
		if f.buckets[i1][k] == 0 {
			f.buckets[i1][k] = fp
			f.numItems++
			return nil
		}
	}

	// Try bucket i2
	for k := 0; k < slotsPerBucket; k++ {
		if f.buckets[i2][k] == 0 {
			f.buckets[i2][k] = fp
			f.numItems++
			return nil
		}
	}

	// If both full, displace/kick
	currIdx := i1
	if randBool() {
		currIdx = i2
	}

	for n := 0; n < maxKicks; n++ {
		slot := randInt(slotsPerBucket)
		kickedFp := f.buckets[currIdx][slot]
		f.buckets[currIdx][slot] = fp

		fp = kickedFp
		currIdx = f.secondaryIndex(currIdx, fp)

		for k := 0; k < slotsPerBucket; k++ {
			if f.buckets[currIdx][k] == 0 {
				f.buckets[currIdx][k] = fp
				f.numItems++
				return nil
			}
		}
	}

	return errors.New("cuckoo filter is full")
}

func (f *Filter) Test(data []byte) bool {
	f.mu.RLock()
	defer f.mu.RUnlock()

	fp := fingerprint(data)
	i1 := f.hashIndex(data)
	i2 := f.secondaryIndex(i1, fp)

	for k := 0; k < slotsPerBucket; k++ {
		if f.buckets[i1][k] == fp || f.buckets[i2][k] == fp {
			return true
		}
	}

	return false
}

func (f *Filter) Delete(data []byte) bool {
	f.mu.Lock()
	defer f.mu.Unlock()

	fp := fingerprint(data)
	i1 := f.hashIndex(data)
	i2 := f.secondaryIndex(i1, fp)

	for k := 0; k < slotsPerBucket; k++ {
		if f.buckets[i1][k] == fp {
			f.buckets[i1][k] = 0
			f.numItems--
			return true
		}
	}

	for k := 0; k < slotsPerBucket; k++ {
		if f.buckets[i2][k] == fp {
			f.buckets[i2][k] = 0
			f.numItems--
			return true
		}
	}

	return false
}

func randBool() bool {
	var b [1]byte
	_, _ = rand.Read(b[:])
	return b[0]&1 == 1
}

func randInt(max int) int {
	var b [1]byte
	_, _ = rand.Read(b[:])
	return int(b[0]) % max
}
