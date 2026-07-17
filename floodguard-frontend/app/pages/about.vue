<script setup>
useHead({ title: 'About — FloodGuard' })
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">

        <h2 class="mb-4">About FloodGuard</h2>

        <section class="mb-5">
          <h5 class="text-uppercase text-muted small mb-2">The Problem</h5>
          <p>
            Rapid, unplanned urbanisation combined with the effects of climate change has made
            flooding and waterlogging a recurring crisis in fast-growing African cities — Accra
            being one of the clearest examples. Choked drainage systems, building on natural
            water channels and wetlands, and increasingly unpredictable rainfall mean that land
            which looks safe and buildable for most of the year can flood seasonally or after a
            single heavy storm.
          </p>
          <p>
            Land buyers, families, and small developers rarely have an easy way to check this
            before they commit. Flood-risk knowledge that does exist is scattered across academic
            research, government agencies, and local word-of-mouth — none of it built for a person
            standing on a plot of land trying to decide whether to buy. The result is a recurring,
            preventable pattern: people invest savings into land that is later damaged, devalued,
            or rendered unusable by flooding, deepening the very climate vulnerability the city is
            already struggling with.
          </p>
          <p class="mb-0">
            This problem is not unique to Accra. Any rapidly urbanising city with weak drainage
            infrastructure and a changing climate faces the same risk — making this a regional,
            not just local, gap.
          </p>
        </section>

        <section class="mb-5">
          <h5 class="text-uppercase text-muted small mb-2">The Solution</h5>
          <p>
            FloodGuard lets anyone check the flood risk of a specific piece of land before they
            buy or build on it — by coordinates, not guesswork.
          </p>
          <ul>
            <li>Drop a pin on a map or enter GPS coordinates for any location.</li>
            <li>
              The app retrieves real, verifiable data for that exact spot: elevation, slope,
              distance to the nearest river or drainage channel, and any recorded flood history.
            </li>
            <li>
              That real data — not the coordinates alone — is passed to an AI model, which
              classifies the location as Low, Medium, or High flood risk and explains why in
              plain language.
            </li>
          </ul>
          <p class="mb-0">
            Because elevation models and mapping data are available globally and free, the same
            system works for any city, not just Accra. Accra is the pilot site; the architecture
            is built to scale to Kumasi, Takoradi, Tamale, and beyond.
          </p>
        </section>

        <section class="mb-5">
          <h5 class="text-uppercase text-muted small mb-2">Community Impact</h5>
          <ul class="mb-0">
            <li><strong>Protects household savings</strong> — helps ordinary families and first-time land buyers avoid investing in land that will flood.</li>
            <li><strong>Supports climate adaptation at the grassroots level</strong> — gives individuals a practical tool to act on climate risk.</li>
            <li><strong>Useful beyond individuals</strong> — local assemblies, estate agencies, and community associations can use it to guide settlement decisions.</li>
            <li><strong>Reduces strain on disaster response</strong> — fewer people settling in high-risk zones means fewer emergency relocations.</li>
            <li><strong>Scalable impact</strong> — extends naturally to other flood-prone cities as it grows.</li>
          </ul>
        </section>

        <section>
          <h5 class="text-uppercase text-muted small mb-2">How Reports Help</h5>
          <p class="mb-0">
            Every flood report submitted by the community strengthens the dataset for everyone
            else. If an area near you has flooded before, reporting it takes a minute and helps
            the next person make a safer decision — no login required.
          </p>
        </section>

        <div class="text-center mt-5">
          <NuxtLink to="/" class="btn btn-primary me-2">Check a location</NuxtLink>
          <NuxtLink to="/report" class="btn btn-outline-danger">Report flooding</NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>