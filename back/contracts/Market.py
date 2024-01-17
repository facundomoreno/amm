from Pool import CPAMM

contract = CPAMM("POL", "MUT")
contract.add_liquidity("POL", 100)
contract.add_liquidity("MUT", 100000)

print("Price of POL in MUT: ", contract.priceOf("POL"))

wallet = {"POL": 200, "MUT": 10000}

print("Swapping 100 MUT for POL")
contract.swap("POL", 200, wallet)

print("Price of POL in MUT: ", contract.priceOf("POL"))
