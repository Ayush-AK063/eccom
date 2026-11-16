import React, { useState } from "react";
import Button from "@mui/material/Button";
import { FaAngleDown } from "react-icons/fa";
import { FaAngleUp } from "react-icons/fa";
import AdminBadge from "../../Components/AdminBadge";
import SearchBox from "../../Components/SearchBox";

const Orders = () => {
  const [isOpenOrderedProduct, setIsOpenOrderedProduct] = useState(null);

  const isShowOrderedProduct = (index) => {
    if (isOpenOrderedProduct === index) {
      setIsOpenOrderedProduct(null);
    } else {
      setIsOpenOrderedProduct(index);
    }
  };

  return (
    <div className="card my-4 shadow-md sm:rounded-lg bg-white">
      <div className="flex items-center justify-between px-5 py-5">
        <h2 className="text-[18px] font-[600]">Recent Orders</h2>
        <div className="w-[40%]">
        <SearchBox/>
        </div>
      </div>
      <div className="relative mt-5 pb-5 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
            <tr>
              <th scope="col" className="px-6 py-3">
                Product
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Order Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Payment Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Name
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Phone no.
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Address
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Pincode
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Total Amount
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Email
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                User Id
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Order Status
              </th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b border-gray-200">
              <td className="px-6 py-4 font-[500]">
                <Button
                  className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]"
                  onClick={() => {
                    isShowOrderedProduct(0);
                  }}
                >
                  {isOpenOrderedProduct === 0 ? (
                    <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                  ) : (
                    <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                  )}
                </Button>
              </td>
              <td className="px-6 py-4 font-[500]">
                <span className="text-primary font-[700]">
                  6846a3b9228db479bb58221a
                </span>
              </td>
              <td className="px-6 py-4 font-[500]">
                <span className="text-primary font-[700]">jvkdnj837kjbf</span>
              </td>
              <td className="px-6 py-4 font-[500] whitespace-nowrap">
                Ayush martand 57
              </td>
              <td className="px-6 py-4 font-[500]">918347737397</td>
              <td className="px-6 py-4 font-[500]">
                <span className="block w-[400px]">
                  asnnan s jc sj jbasbfuabfb j csj ccs j India
                </span>
              </td>
              <td className="px-6 py-4 font-[500]">210001</td>
              <td className="px-6 py-4 font-[500]">45999</td>
              <td className="px-6 py-4 font-[500]">ayushmartandas@gmail.com</td>
              <td className="px-6 py-4 font-[500]">
                <span className="text-primary font-[700]">
                  68020c35228db479bb25633a
                </span>
              </td>
              <td className="px-6 py-4 font-[500]">
                <AdminBadge status="pending" />
              </td>
              <td className="px-6 py-4 font-[500] whitespace-nowrap">
                2025-06-09
              </td>
            </tr>

            {isOpenOrderedProduct === 0 && (
              <tr>
                <td className="pl-28 " colSpan="6">
                  <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                      <tr>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Product Id
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Product Title
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Image
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Sub Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-[500]">
                          <span className="text-gray-600">
                            6846a3b9228db479bb58221a
                          </span>
                        </td>
                        <td className="px-6 py-4 font-[500]">
                          abajjhvsvchj hjs jhvcadv....
                        </td>
                        <td className="px-6 py-4 font-[500] whitespace-nowrap">
                          <img
                            src=""
                            className="w-[40px] h-[40px] object-cover rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4 font-[500]">2</td>
                        <td className="px-6 py-4 font-[500]">2000</td>
                        <td className="px-6 py-4 font-[500]">1300</td>
                      </tr>

                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-[500]">
                          <span className="text-gray-600">
                            6846a3b9228db479bb58221a
                          </span>
                        </td>
                        <td className="px-6 py-4 font-[500]">
                          abajjhvsvchj hjs jhvcadv....
                        </td>
                        <td className="px-6 py-4 font-[500] whitespace-nowrap">
                          <img
                            src=""
                            className="w-[40px] h-[40px] object-cover rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4 font-[500]">2</td>
                        <td className="px-6 py-4 font-[500]">2000</td>
                        <td className="px-6 py-4 font-[500]">1300</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            )}

            <tr className="bg-white border-b border-gray-200">
              <td className="px-6 py-4 font-[500]">
                <Button
                  className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]"
                  onClick={() => {
                    isShowOrderedProduct(1);
                  }}
                >
                  {isOpenOrderedProduct === 1 ? (
                    <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                  ) : (
                    <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                  )}
                </Button>
              </td>
              <td className="px-6 py-4 font-[500]">
                <span className="text-primary font-[700]">
                  6846a3b9228db479bb58221a
                </span>
              </td>
              <td className="px-6 py-4 font-[500]">
                <span className="text-primary font-[700]">jvkdnj837kjbf</span>
              </td>
              <td className="px-6 py-4 font-[500] whitespace-nowrap">
                Ayush martand 57
              </td>
              <td className="px-6 py-4 font-[500]">918347737397</td>
              <td className="px-6 py-4 font-[500]">
                <span className="block w-[400px]">
                  asnnan s jc sj jbasbfuabfb j csj ccs j India
                </span>
              </td>
              <td className="px-6 py-4 font-[500]">210001</td>
              <td className="px-6 py-4 font-[500]">45999</td>
              <td className="px-6 py-4 font-[500]">ayushmartandas@gmail.com</td>
              <td className="px-6 py-4 font-[500]">
                <span className="text-primary font-[700]">
                  68020c35228db479bb25633a
                </span>
              </td>
              <td className="px-6 py-4 font-[500]">
                <AdminBadge status="pending" />
              </td>
              <td className="px-6 py-4 font-[500] whitespace-nowrap">
                2025-06-09
              </td>
            </tr>

            {isOpenOrderedProduct === 1 && (
              <tr>
                <td className="pl-28 " colSpan="6">
                  <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                      <tr>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Product Id
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Product Title
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Image
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 whitespace-nowrap">
                          Sub Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-[500]">
                          <span className="text-primary">
                            6846a3b9228db479bb58221a
                          </span>
                        </td>
                        <td className="px-6 py-4 font-[500]">
                          abajjhvsvchj hjs jhvcadv....
                        </td>
                        <td className="px-6 py-4 font-[500] whitespace-nowrap">
                          <img
                            src=""
                            className="w-[40px] h-[40px] object-cover rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4 font-[500]">2</td>
                        <td className="px-6 py-4 font-[500]">2000</td>
                        <td className="px-6 py-4 font-[500]">1300</td>
                      </tr>

                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-[500]">
                          <span className="text-primary">
                            6846a3b9228db479bb58221a
                          </span>
                        </td>
                        <td className="px-6 py-4 font-[500]">
                          abajjhvsvchj hjs jhvcadv....
                        </td>
                        <td className="px-6 py-4 font-[500] whitespace-nowrap">
                          <img
                            src=""
                            className="w-[40px] h-[40px] object-cover rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4 font-[500]">2</td>
                        <td className="px-6 py-4 font-[500]">2000</td>
                        <td className="px-6 py-4 font-[500]">1300</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
